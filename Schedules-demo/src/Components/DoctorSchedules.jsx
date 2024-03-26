import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import Event from './Event';

const localizer = momentLocalizer(moment);

const DoctorSchedules = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsResponse = await fetch('https://hms-json.onrender.com/appointments');
        const patientsResponse = await fetch('https://hms-json.onrender.com/patients');
        const appointmentsData = await appointmentsResponse.json();
        const patientsData = await patientsResponse.json();
        setAppointments(appointmentsData);
        setPatients(patientsData);
      } catch (error) {
        setError("Error: " + error);
      }
    };

    fetchData();
  }, []);

  const events = appointments.map(appointment => {
    const patientsDetails = patients.find(patients => patients.id === appointment.patientId);
    return {
      title: appointment.doctor,
      start: new Date(appointment.date),
      end: new Date(new Date(appointment.date).setHours(new Date(appointment.date).getHours() + 1)),
      patients: patientsDetails,
    };
  });

  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {
      backgroundColor: '#f0f0f0',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'black',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100vh', width: '100%' }}
        defaultView={Views.MONTH}
        titleAccessor="title"
        components={{
          event: Event, 
        }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}

export default DoctorSchedules;
