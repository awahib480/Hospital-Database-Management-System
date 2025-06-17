from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from flask_cors import CORS, cross_origin
from models import db, Appointment, Patient  #Import Appointment and Patient model
import cx_Oracle

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})  #allow all origins

# Oracle Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+cx_oracle://C##scott:tiger@localhost:1521/xe'  # Database username and password along with service name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


# Route to Home page
@app.route('/')
def home():
    return "Hospital API is running!"


# Route to get data from the Doctor table using raw SQL
@app.route('/doctor', methods=['GET'])
def get_doctor_data():
    try:
        query = text("SELECT 'TMH-D-' || LPAD(d.doctorid, 4, '0') as DoctorID, d.name as Name, d.contactno as ContactNo, d.email as Email, d.specialization as Specialization, d.experienceyears as ExperienceYears, dept.deptname as DeptName FROM Doctor d JOIN Department dept ON d.deptid = dept.deptid")
        result = db.session.execute(query)
        doctor_list = [{"id": row[0], "name": row[1], "contactno": row[2], "email": row[3], "specialization": row[4], "expyears": row[5], "deptname": row[6]} for row in result]
        return jsonify(doctor_list)
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


# Route to get data from the Patient table using raw SQL
@app.route('/patient', methods=['GET'])
def get_patient_data():
    try:
        query = text("SELECT 'TMH-P-' || LPAD(patientid, 4, '0') as PatientID, name as Name, age as Age, gender as Gender, phoneno as PhoneNo, email as Email FROM Patient")
        result = db.session.execute(query)
        patient_list = [{"id": row[0], "name": row[1], "age": row[2], "gender": row[3], "phoneno": row[4], "email": row[5]} for row in result]
        return jsonify(patient_list)
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


# Route to get data from the Appointment table using raw SQL
@app.route('/appointment', methods=['GET'])
def get_appointment_data():
    try:
        query = text("SELECT apt.appointmentid AS rawid, 'TMH-A-' || LPAD(apt.appointmentid, 4, '0') AS AppointmentID, p.name AS PatientName, d.name AS DoctorName, dept.deptname AS DeptName, apt.appointmentdate AS Appt_Date, apt.status AS AppointmentStatus FROM Appointment apt JOIN Patient p ON apt.patientid = p.patientid JOIN Doctor d ON apt.doctorid = d.doctorid JOIN Department dept ON apt.deptid = dept.deptid")
        result = db.session.execute(query)
        appointment_list = [{"id": row[0], "displayid": row[1], "patientname": row[2], "doctorname": row[3], "deptname": row[4], "date": row[5], "status": row[6]} for row in result]
        return jsonify(appointment_list)
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


# Route to get data from the Department table using raw SQL
@app.route('/department', methods=['GET'])
def get_department_data():
    try:
        query = text("SELECT * FROM DEPARTMENT")
        result = db.session.execute(query)
        department_list = [{"id": row[0], "deptname": row[1], "location": row[2], "HODname": row[3]} for row in result]
        return jsonify(department_list)
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


# Route to put/change appointment status (Admin)
@app.route('/appointment/<int:id>/status', methods=['PUT'])
@cross_origin(origin='http://localhost:5501', headers=['Content-Type'])
def update_appointment_status(id):
    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    appointment = db.session.get(Appointment, id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    appointment.status = new_status
    db.session.commit()

    return jsonify({'message': 'Status updated successfully'})


# Route to book an appointment
@app.route('/book', methods=['PUT', 'OPTIONS'])
@cross_origin(origin='http://localhost:5501', headers=['Content-Type'])
def book_appointment():
    if  request.method == 'OPTIONS':
        return '', 204  #Preflight OK
    try:
        data = request.get_json()
        print('Received data:', data)  # Debug

        name = data['name']
        age = data['age']
        gender = data['gender']
        phoneno = data['phoneno']
        email = data['email']
        doctor_id = data['doctor']
        appt_date = data['date']

        #  Extract department ID based on doctor ID
        dept_map = {
            "1": 1, "2": 1, "3": 1,          # Cardiology
            "4": 2, "5": 2, "6": 2,          # Neurology
            "7": 3, "8": 3, "9": 3,          # Orthopedics
            "10": 4, "11": 4, "12": 4,       # Pediatrics
            "13": 5, "14": 5, "15": 5,       # General Surgery
            "16": 6, "17": 6, "18": 6,       # Dermatology
            "19": 7, "20": 7, "21": 7,       # Oncology
            "22": 8, "23": 8, "24": 8,       # Radiology
            "25": 9, "26": 9, "27": 9,       # Psychiatry
            "28": 10, "29": 10, "30": 10     # Urology
        }

        dept_id = dept_map.get(doctor_id)
        if not dept_id:
            return jsonify({'success': False, 'error': 'Invalid doctor ID'}), 400

        # Insert into Patient
        db.session.execute(text("""
            INSERT INTO patient (NAME, AGE, GENDER, PHONENO, EMAIL)
            VALUES (:name, :age, :gender, :phoneno, :email)
        """), {
            'name': name,
            'age': age,
            'gender': gender,
            'phoneno': phoneno,
            'email': email
        })

        # Get latest PATIENTID
        result = db.session.execute(text("SELECT MAX(PATIENTID) FROM patient"))
        patient_id = result.scalar()

        # Insert into Appointment
        db.session.execute(text("""
            INSERT INTO appointment (PATIENTID, DOCTORID, DEPTID, APPOINTMENTDATE, STATUS)
            VALUES (:patientid, :doctorid, :deptid, TO_DATE(:appt_date, 'YYYY-MM-DD'), 'Pending')
        """), {
            'patientid': patient_id,
            'doctorid': doctor_id,
            'deptid': dept_id,
            'appt_date': appt_date
        })

        # Get latest APPOINTMENTID
        result = db.session.execute(text("SELECT MAX(APPOINTMENTID) FROM appointment"))
        appointment_id = result.scalar()

        db.session.commit()

        return jsonify({
            'success': True,
            'appointment_id': appointment_id,
            'message': f'Appointment booked! Use ID {appointment_id} to check status.'
        })

    except Exception as e:
        db.session.rollback()
        print('Error occurred:', str(e))  # Debug
        return jsonify({'success': False, 'error': str(e)}), 500


# Route to check appointment status
@app.route('/status/<int:appointmentid>', methods=['GET', 'OPTIONS'])
def check_status(appointmentid):
    try:
        appointment_id = appointmentid  # Coming from URL parameter
        print(f'Looking up: {appointment_id}')  # Debug

        result = db.session.execute(text("""
        SELECT 
        p.NAME AS patient_name,
        d.NAME AS doctor_name,
        dept.DEPTNAME AS department_name,
        a.APPOINTMENTDATE AS appointment_date,
        a.STATUS AS status
        FROM appointment a
        JOIN patient p ON a.PATIENTID = p.PATIENTID
        JOIN doctor d ON a.DOCTORID = d.DOCTORID
        JOIN department dept ON a.DEPTID = dept.DEPTID
        WHERE a.APPOINTMENTID = :appid
        """).columns(
        patient_name=db.String,
        doctor_name=db.String,
        department_name=db.String,
        appointment_date=db.DateTime,
        status=db.String
        ), {'appid': appointment_id})

        row = result.fetchone()

        if row:            
            return jsonify({
            'success': True,
            'appointment_id': appointment_id,
            'patient_name': row[0],
            'doctor_name': row[1],
            'department_name': row[2],
            'appointment_date': row[3].strftime('%Y-%m-%d'),
            'status': row[4]})
        else:
            return jsonify({'success': False, 'message': 'No appointment found for given ID'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


# Route for searching doctor details for doctor page
@app.route("/search_doctor", methods=["POST"])
def search_doctor():
    data = request.json
    doctor_name = data.get("name", "").strip()

    if not doctor_name:
        return jsonify({"error": "NAME is required"}), 400

    try:
        sql_query = text('SELECT * FROM DOCTOR WHERE "NAME" = :name')
        result = db.session.execute(sql_query, {"name": doctor_name})
        doctor = result.fetchone()

        if doctor:
            doctor_data = {
                "doctor_id": doctor[0],
                "doctor_name": doctor[1],
                "contact_no": doctor[2],
                "email": doctor[3],
                "specialization": doctor[4],
                "experienceyears": doctor[5] 
            }
            return jsonify(doctor_data)
        else:
            return jsonify({"error": "Doctor not found"}), 404

    except Exception as err:
        return jsonify({"error": str(err)}), 500



if __name__ == "__main__":
    app.run(debug=True)
