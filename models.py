from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Appointment(db.Model):
    __tablename__ = 'APPOINTMENT'
    appointmentid = db.Column(db.Integer, primary_key=True)
    patientid = db.Column(db.Integer)     
    doctorid = db.Column(db.Integer)       
    deptid = db.Column(db.Integer)         
    appointmentdate = db.Column(db.DateTime)
    status = db.Column(db.String(50), nullable=False)

class Patient(db.Model):
    __tablename__ = 'PATIENT'
    patientid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    phoneno = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=False)

    def _repr_(self):
        return f"<Patient {self.name} (ID: {self.patientid})>"
