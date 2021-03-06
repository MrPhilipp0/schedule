import { useRef, useEffect, useState, useContext } from 'react';
import { connect } from 'react-redux';

import { BlockFlagContext } from '../Context/BlockFlagContext';
import { checkTask } from '../../actions/taskActions';
import Filter from './Filter';

import { MOBILE, ACTUAL_DATE, ICONS, DEFAULT_FILTER_OBJECT, DEFAULT_FILTER_CATEGORIES, COLORS } from '../../store/constants';

import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import gsap from 'gsap';

import '../../styles/App.css';
import YourTasksDay from './YourTasksDay';


const sortingTasksFunctionByDate = (a, b) => {
  let date1 = a.idDay.split('.');
  let date2 = b.idDay.split('.');
  date1 = new Date(date1[2], date1[1]-1, date1[0], 0, 0);
  date2 = new Date(date2[2], date2[1]-1, date2[0], 0, 0);
  date1 = date1.getTime();
  date2 = date2.getTime();
  return date1 - date2
}

export const sortingTasksFunctionByTime = (a, b) => {
  let time1 = a.time.split(':');
  let time2 = b.time.split(':');
  time1 = 60 * time1[0] + time1[1];
  time2 = 60 * time2[0] + time2[1];
  return time1 - time2
}

const YourTasks = ({currentTasks, checkTask}) => {

  const mapStorageTasks = () => {
    let tasks = [];
    [...currentTasks].forEach(element => {
      !tasks.includes(element.idDay) && tasks.push(element.idDay);
    });
  
    tasks = tasks.map(idDay => {
      const dayArr = [...currentTasks].filter(task => task.idDay === idDay);
      dayArr.sort(sortingTasksFunctionByTime);
      const day = {
        idDay,
        weekDay: dayArr[0].weekDay,
        link: dayArr[0].link,
        tasks: dayArr,
      }
      return day;
    })
  
    tasks.sort(sortingTasksFunctionByDate);
    return tasks;
  }

  const {blockFlag} = useContext(BlockFlagContext);

  const [mainTasksArray, setMainTasksArray] = useState(mapStorageTasks());
  const [tasksArrayWithFilter, setTasksArrayWithFilter] = useState(mainTasksArray);
  const [filter, setFilter] = useState(DEFAULT_FILTER_OBJECT);

  const [visibilityTasksList, setVisibilityTasksList] = useState(true);

  const handleSetVisibilityTasksList = () => {
    if (visibilityTasksList) {
      moveToLeft(true);
    } else {
      setVisibilityTasksList(!visibilityTasksList);
      moveFromLeft();
    }
  }

// **********************************************************************************************************************
  // ANIMATIONS (GSAP)
  let dayElementWrapper = useRef(null);

  const moveFromLeft = () => {
    const elements = {
      tasks: dayElementWrapper.querySelectorAll( '.importantShortTask'),
      weekDays: dayElementWrapper.querySelectorAll( '.dayElement'),
    };

    const tl = gsap.timeline({autoRemoveChildren: true});
    tl.fromTo([...elements.weekDays] , {x:'-125%', autoAlpha: .1}, {x:'0%', autoAlpha:1, stagger:.1, duration: 1, ease:'power4.out'})
      .fromTo([...elements.tasks], {x:'-125%', autoAlpha: .1}, {x:'0%', autoAlpha:1, stagger:0.005, duration: 1.5, delay:-1.8,  ease:'power4.out'});
  };

  const moveToLeft = (visibility = false) => {
    const elements = {
      tasks: dayElementWrapper.querySelectorAll( '.importantShortTask'),
      weekDays: dayElementWrapper.querySelectorAll( '.dayElement'),
    };

    const tl = gsap.timeline({autoRemoveChildren: true});
    tl.to([...elements.weekDays] , {x:'-50%', autoAlpha:0, stagger:.1, duration: .4, ease:'expo'})
      .to([...elements.tasks], {x:'-50%', autoAlpha:0, stagger:0.005, duration: .4, delay: -1.3,  ease:'expo'})
      .then(() => visibility && setVisibilityTasksList(!visibilityTasksList));
  };
  
  useEffect(() => moveFromLeft(), [])
// ***********************************************************************************************************************


  // Uploading main tasks state
  useEffect(() => {
    setMainTasksArray(mapStorageTasks());
  // eslint-disable-next-line
  },[currentTasks])
  
  // Filtration main tasks state
  useEffect(() => {
    let arrayTasks = JSON.parse(JSON.stringify(mainTasksArray));
    arrayTasks.map(day => {
      day.tasks = day.tasks.filter(task => (

        // Filtration by verification
        (filter.verified === 'All' ? true : (filter.verified === 'Check' ? task.check : !task.check))
        &&

        // Filtration by categories
        (filter.categories.some(category => category.status && category.name === task.category))
      ));

        // Filtration by date
      day.tasks = day.tasks.filter(task => {
        const taskDay = day.idDay.split('.');
        const taskTime = task.time.split(':');
        const taskDate = new Date(taskDay[2], taskDay[1]-1, taskDay[0], taskTime[0], taskTime[1]);

        if (filter.time === 'Future') {
          return taskDate > ACTUAL_DATE
        } else if (filter.time === 'Past') {
          return taskDate < ACTUAL_DATE
        } else {
          return true;
        }
      })

      return day
    });
    setTasksArrayWithFilter(arrayTasks.filter(day => day.tasks.length > 0));

  },[filter, mainTasksArray])

  return (
    <div className="rounded text-center mt-2 mb-5 pt-3 mx-1 fs-6" style={{color:'white'}}>
      <div className="d-flex justify-content-center">

        {/* Visibility list*/}
        <Button onClick={handleSetVisibilityTasksList} style={{borderRadius:'9px', borderColor:COLORS.blue3, background:COLORS.blue3}} className="my-3 p-1 px-2 me-3">
          <FontAwesomeIcon icon={visibilityTasksList ? ICONS.showTasks : ICONS.hiddenTasks} className="p-0 fs-4"/>
        </Button>
        
        <p className="fs-1 m-0 mt-2">
          <b>Your tasks:</b>
        </p>
      </div>

      {/* FILTER */}
      <div className="py-2 border-bottom border-top" >
        <Filter setFilter={setFilter} categories={DEFAULT_FILTER_CATEGORIES} animationMoveFromLeft={moveFromLeft} animationMoveToLeft={moveToLeft}/>
      </div>

      <div 
        ref={el => dayElementWrapper = el} 
        className="ps-0 pe-2 tasksList align-items-start" 
        style={MOBILE ? {maxHeight:"30vh", overflowY:'auto', overflowX:'hidden'} : {height:"60vh", overflowY:'auto',overflowX:'hidden'}} 
        hidden={!visibilityTasksList}>

        {/* MAP DAYS */} 
        {
          tasksArrayWithFilter.map(day => (
            <YourTasksDay key={day.idDay} day={day} checkTask={checkTask} blockFlag={blockFlag} />
          ))
        }
        {!tasksArrayWithFilter.length && 
          <label className="py-2 fs-5">
            No tasks, add new task or change filter.
          </label>
        } 
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    currentTasks: state.TasksReducer.tasks,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkTask : id => {
      dispatch(checkTask(id));
    }
  }
}

 
export default connect(mapStateToProps, mapDispatchToProps)(YourTasks);