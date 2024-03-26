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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = fetch('https://hms-json.onrender.com/appointments')
      .then(response => response.json());

    const fetchPatients = fetch('https://hms-json.onrender.com/patients')
      .then(response => response.json());

    const fetchDoctors = fetch('https://hms-json.onrender.com/doctors')
      .then(response => response.json());

    Promise.all([fetchAppointments, fetchPatients, fetchDoctors])
      .then(async ([appointmentsData, patientsData, doctorsData]) => {
        const appointments = await appointmentsData;
        const patients = await patientsData;
        const doctors = await doctorsData; 
        setAppointments(appointments);
        setPatients(patients);
        setDoctors(doctors); 
      })
      .catch(error => {
        setError("Error: " + error);
      });
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

  const addAppointment = (appointment) => {
    // Find the doctor's name using the doctorId
    const doctorName = doctors.find(doctor => doctor.id === parseInt(appointment.doctor)).name;
    
    // Create a new appointment with the doctor's name
    const newAppointment = {
      ...appointment,
      doctor: doctorName,
    };
    
    setAppointments([...appointments, newAppointment]);
  };
  
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <form onSubmit={(event) => {
        event.preventDefault();
        const doctorId = event.target.elements.doctor.value;
        const patientId = event.target.elements.patient.value;
        const date = event.target.elements.date.value;
        addAppointment({
          doctor: doctorId,
          patientId: patientId,
          date: date,
        });
      }}>
        <label>
          Doctor:
          <select name="doctor">
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </select>
        </label>
        <label>
          Patient:
          <select name="patient">
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input type="datetime-local" name="date" />
        </label>
        <button type="submit">Add Appointment</button>
      </form>
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
