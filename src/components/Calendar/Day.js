import React from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../Context/TaskToContext';
import SimpleOverlayTriggerObject from '../OverlayTriggers/SimpleOverlayTriggerObject';
import { actualDate } from '../../App';

const Day = (props) => {
  const {tasksList} = React.useContext(TaskContext);
  const daysWithTasks = tasksList.filter(item => item.idDay === props.id)[0];

  const actualDay = 
  (actualDate.getDate() < 10 ? '0' + actualDate.getDate() : actualDate.getDate())
   + '.' + 
  (Number(actualDate.getMonth()+1) < 10 ? '0' + Number(actualDate.getMonth()+1) : Number(actualDate.getMonth()+1))
   + '.' + 
  actualDate.getFullYear(); 
  
  let dayStyle = {
    width: '14.285714285714286%',
    minHeight:'70px',
    backgroundColor:'#61A5C2',
  }; //zmienna zarządzająca klasami stylów 

  if (actualDay === props.id) {
    dayStyle.backgroundColor = '#014F86';
  }
  const link = `/calendar/tasks/${props.id}`; // stała z linkiem do danego dnia

  const dayTasksCounter = () => {
    if (daysWithTasks) {
      return (
        <div>
          <svg className="mb-0"viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="45">
            <path fill="#f72585" d="M45.2,-51.4C58.8,-42.5,70.2,-28.4,72.9,-12.9C75.6,2.6,69.6,19.7,61.1,36C52.5,52.4,41.5,68.1,26.5,74.2C11.5,80.2,-7.6,76.7,-22.9,68.6C-38.2,60.5,-49.8,48,-59.7,33.3C-69.5,18.6,-77.5,1.8,-78,-16.9C-78.5,-35.6,-71.3,-56.1,-57.1,-64.8C-42.8,-73.6,-21.4,-70.7,-2.8,-67.3C15.8,-64,31.6,-60.3,45.2,-51.4Z" transform="translate(100 80)" />
            <text fontSize="450%" className="fw-bold" x="75" y="125" width="300%" height="300%" fill="black" transform="translate(0 -20)" >{daysWithTasks.tasks.length}</text>
          </svg>
        </div>

      );
    }
  }

  const dayObjectText = () => {
    const day = tasksList.filter(day => day.idDay === props.id);
    let object = null;
    if (day.length > 0) {
      object = JSON.parse(JSON.stringify(day[0].tasks));
      object.length = object.length > 5 ? 5 : object.length;
      object = object.map((task, index) => {
        return (
          <div key={index + '_text'}>
            <label><strong>{task.shortName}</strong></label>
            <div className="d-flex justify-content-between">
              <p className="me-2">{task.category}</p>
              <p>{task.time}</p>
            </div>
          </div>
        )
      })
      day[0].tasks.length > 5 && object.push(
        <div key={object.length + 1 + '_dots'} className="d-flex justify-content-center">
          <label><strong> ... </strong></label>
        </div>
      );
    }
    return (object);
  }

  const overlayTriggerPlacement = () => {
    if (props.weekday === "Mon" || props.weekday === "Thu" || props.weekday === "Wed") {
      return 'right'
    } else {
      return 'left'
    }
  }

  const dayObject = {
    id: props.id,
    text: dayObjectText(),
    placement: overlayTriggerPlacement(),
    object: 
    <Link to={link} style={dayStyle} className="border col-success text-reset text-decoration-none Days actualDayStyle">
      <div> 
        <p className="flex-shrink-1 fw-bold text-end me-2 mt-1 mb-0 lh-1">
          {props.number} 
        </p>
        <div className="mt-1 w-100 flex-shrink-1">
          {dayTasksCounter()}
        </div>
      </div>
    </Link>
  }
  
  // funkcja która dla dnia który istnieje tworzy konkretny blok z linkiem do niego, jeżeli nie istnieje to tworzy pusty div.
  const day = () => {
    if (props.number) {
      if (daysWithTasks) {
        return (
          SimpleOverlayTriggerObject({...dayObject})
        )
      } else {
        return (
          dayObject.object
        )
      }
    } else {
      return (
        <div className=" text-center border" key={props.keys} style={{width: '14.285714285714286%', backgroundColor:'#A9D6E5',minHeight:'70px'}}></div>
      )
    }
  }
  
  return ( 
    day()
  );
}
 
export default Day;