import React, { useState } from 'react';

const Event = ({ event }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <strong>{event.title}</strong>
      {hover && event.patients && (
        <div>
           <p>Patient: {event.patients.name}</p>
           <p>History: {event.patients.medicalHistory}</p>    
        </div>
      )}
    </div>
  );
};

export default Event;
