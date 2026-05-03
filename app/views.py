from django.shortcuts import render, redirect
from .models import Student
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
import json
from django.http import JsonResponse


# Create your views here.
def index(request):
    if request.method == "POST":

        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)

            # ADMIN CHECK
            if user.username == "admin":
                return redirect('/admindash/')
            else:
                return redirect('/studentdash/')

        return render(request, 'index.html', {
            'error': 'Invalid credentials'
        })

    return render(request, 'index.html')

def admindash(request):
        students = Student.objects.all()   

        return render(request, 'admindash.html', {
            'students': students
    })

def studentdash(request):
    if request.method == "POST":
        name = request.POST.get('name')
        mark = request.POST.get('mark')
        course = request.POST.get('course')

        Student.objects.create(
            name=name,
            mark=mark,
            course=course
        )

        return redirect('/')  

    return render(request, 'studentdash.html')

def apply(request):
    if request.method == "POST":
        fullname = request.POST.get('fullname')
        email = request.POST.get('email')
        dob = request.POST.get('dob')
        address = request.POST.get('address')
        marks = request.POST.get('marks')
        username = request.POST.get('username')
        password = request.POST.get('password')
        

        pref1 = request.POST.get('pref1')
        pref2 = request.POST.get('pref2')
        pref3 = request.POST.get('pref3')

        certificate = request.FILES.get('certificate')

        # Prevent duplicate preferences
        if pref1 == pref2 or pref1 == pref3 or pref2 == pref3:
            return render(request, 'apply.html', {
                'error': 'Choose different courses for each preference'
            })

        # Create user
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        # Save student data
        Student.objects.create(
            user=user,
            name=fullname,
            email=email,
            dob=dob,
            address=address,
            certificate=certificate,
            pref1=pref1,
            pref2=pref2,
            pref3=pref3,
            marks=marks
        )

        return redirect('/')

    return render(request, 'apply.html')

def set_seats(request):
    if request.method == "POST":
        request.session['total_seats'] = int(request.POST.get('seats'))
        return redirect('/admindash/')
    

def allocate_students(request):

    course = request.session.get('selected_course')
    seats = request.session.get('total_seats', 0)

    allocated = []
    allocated_ids = set()

    # =========================
    # STEP 1: PREF1
    # =========================
    pref1_students = Student.objects.filter(pref1=course).order_by('-marks')

    for student in pref1_students:
        if len(allocated) >= seats:
            break

        allocated.append(student)
        allocated_ids.add(student.id)

    # =========================
    # STEP 2: PREF2
    # =========================
    if len(allocated) < seats:

        pref2_students = Student.objects.filter(pref2=course).order_by('-marks')

        for student in pref2_students:
            if len(allocated) >= seats:
                break

            if student.id not in allocated_ids:
                allocated.append(student)
                allocated_ids.add(student.id)

    # =========================
    # STEP 3: PREF3
    # =========================
    if len(allocated) < seats:

        pref3_students = Student.objects.filter(pref3=course).order_by('-marks')

        for student in pref3_students:
            if len(allocated) >= seats:
                break

            if student.id not in allocated_ids:
                allocated.append(student)
                allocated_ids.add(student.id)

    # =========================
    # FINAL OUTPUT
    # =========================
    result = []

    for student in allocated:
        result.append({
            "name": student.name,
            "marks": student.marks,
            "course": course
        })

    return JsonResponse({
        "allocated": result
    })


def set_config(request):

    if request.method == "POST":
        try:
            data = json.loads(request.body)

            request.session['selected_course'] = data.get('course')
            request.session['total_seats'] = int(data.get('seats'))

            return JsonResponse({
                "message": "Configuration saved successfully"
            })

        except Exception as e:
            return JsonResponse({
                "message": "Error in configuration",
                "error": str(e)
            }, status=400)
    

def allocate_students(request):

    course = request.session.get('selected_course')
    seats = request.session.get('total_seats', 0)

    allocated = []
    used_ids = set()

    def get_students(pref_field):
        return Student.objects.filter(**{pref_field: course}).order_by('-marks')

    # ========================
    # PREF 1
    # ========================
    for s in get_students("pref1"):
        if len(allocated) >= seats:
            break
        allocated.append(s)
        used_ids.add(s.id)

    # ========================
    # PREF 2
    # ========================
    if len(allocated) < seats:
        for s in get_students("pref2"):
            if len(allocated) >= seats:
                break
            if s.id not in used_ids:
                allocated.append(s)
                used_ids.add(s.id)

    # ========================
    # PREF 3
    # ========================
    if len(allocated) < seats:
        for s in get_students("pref3"):
            if len(allocated) >= seats:
                break
            if s.id not in used_ids:
                allocated.append(s)
                used_ids.add(s.id)

    # ========================
    # RESPONSE
    # ========================
    result = []

    for s in allocated:
        result.append({
            "name": s.name,
            "marks": s.marks,
            "course": course
        })

    return JsonResponse({"allocated": result})
