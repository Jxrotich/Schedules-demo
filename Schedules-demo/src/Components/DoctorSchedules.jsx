import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import Event from './Event';

const localizer = momentLocalizer(moment);

const DoctorSchedules = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('https://hms-json.onrender.com/appointments').then(response => response.json()),
      fetch('https://hms-json.onrender.com/patients').then(response => response.json()),
      fetch('https://hms-json.onrender.com/doctors').then(response => response.json())
    ])
    .then(([appointmentsData, patientsData, doctorsData]) => {
      console.log(appointmentsData);
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    })
    .catch(error => console.error('Error:', error));
   }, []);
   useEffect(() => {
    fetch('https://hms-json.onrender.com/appointments')
      .then(response => response.json())
      .then(appointmentsData => {
        const mappedAppointments = appointmentsData.map(appointment => {
          const doctor = doctors.find(doc => doc.id === appointment.doctor);
          const patient = patients.find(pat => pat.id === appointment.patient);
  
          return {
            ...appointment,
            doctor,
            patient,
          };
        });
        setAppointments(mappedAppointments);
    })
    .catch(error => console.error('Error:', error));
}, [doctors, patients]);
    

  const handleAddAppointment = (e) => {
    e.preventDefault();

    const newAppointment = {
      doctor: selectedDoctor,
      patient: selectedPatient,
      date: selectedDate,
      time: selectedTime,
    };

    fetch('https://hms-json.onrender.com/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAppointment),
    })
    .then(response => response.json())
    .then(data => {
      setAppointments([...appointments, data]);
      setSelectedDoctor('');
      setSelectedPatient('');
      setSelectedDate('');
      setSelectedTime('');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <div style={{ height: '100vh' }}>
      <form onSubmit={handleAddAppointment}>
        <label>
        Doctor:
          <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
            {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
          </select>
        </label>
        <label>
        Patient:
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            {patients.map(pat => <option key={pat.id} value={pat.id}>{pat.name}</option>)}
          </select>
        </label>
        <label>
        Date:
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </label>
        <label>
        Time:
          <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} /> {}
        </label>
        <button type="submit">Add Appointment</button>
      </form>
      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100vh', width: '100%' }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView={Views.MONTH}
        titleAccessor="title"
        components={{
          event: Event, 
        }}
      />
    </div>
  );
};

export default DoctorSchedules;
