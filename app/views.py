from django.shortcuts import render, redirect
from .models import Student
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


# Create your views here.

def register(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'User already exists'})

        User.objects.create_user(username=username, password=password)
        return redirect('/')

    return render(request, 'register.html')


def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)

            if user.is_staff:   # ✅ FIXED
                return redirect('/admindash/')
            else:
                return redirect('/studentdash/')

        return render(request, 'login.html', {'error': 'Invalid credentials'})

    return render(request, 'login.html')


def admindash(request):
        students = Student.objects.all()   

        return render(request, 'admindash.html', {
            'students': students
    })

def studentdash(request):
    return render(request, 'studentdash.html')


@login_required
def apply(request):
    if request.method == "POST":

        fullname = request.POST.get('fullname')

        maths = get_mark(request.POST.get('maths'))
        physics = get_mark(request.POST.get('physics'))
        chemistry = get_mark(request.POST.get('chemistry'))
        biology = get_mark(request.POST.get('biology'))
        computer = get_mark(request.POST.get('computer'))
        english = get_mark(request.POST.get('english'))
        commerce = get_mark(request.POST.get('commerce'))

        total = sum([m for m in [maths, physics, chemistry, biology, computer, english, commerce] if m is not None])

        pref1 = request.POST.get('pref1')
        pref2 = request.POST.get('pref2')
        pref3 = request.POST.get('pref3')

        user = request.user

        if Student.objects.filter(user=user).exists():
            return render(request, 'apply.html', {'error': 'Already applied'})

        phase = request.session.get("phase", "open")

        # =========================
        # RULE ENGINE
        # =========================
        if phase == "open":
            is_pending = False

        elif phase in ["allocate", "freeze"]:
            is_pending = True

        Student.objects.create(
            user=user,
            name=fullname,
            maths=maths,
            physics=physics,
            chemistry=chemistry,
            biology=biology,
            computer=computer,
            english=english,
            commerce=commerce,
            marks=total,
            pref1=pref1,
            pref2=pref2,
            pref3=pref3,
            is_pending=is_pending,
            is_allocated=False,
            allocated_course=None
        )

        return redirect('/studentdash/')

    return render(request, 'apply.html')



def get_mark(value):
    return int(value) if value else None



def get_score(student, course):

    if course == "Computer Science":
        if student.maths is not None and student.computer is not None:
            return (student.maths + student.computer) * 2

    elif course == "Mathematics":
        if student.maths is not None:
            return student.maths * 2

    elif course == "Statistics":
        if student.maths is not None:
            return student.maths * 2

    elif course == "Business Studies":
        if student.commerce is not None:
            return student.commerce * 2

    elif course == "Malayalam":
        if student.english is not None:
            return student.english * 2

    # 🔥 fallback
    return student.marks



def set_seats(request):
    if request.method == "POST":
        request.session['total_seats'] = int(request.POST.get('seats'))
        return redirect('/admindash/')
    

def allocate_students(request):

    phase = request.session.get("phase", "open")

    # =========================
    # BLOCK IF NOT ALLOWED
    # =========================
    if phase == "freeze":
        return JsonResponse({
            "allocated": [],
            "message": "No changes allowed. Final list is locked."            
        })

    if phase != "allocate":
        return JsonResponse({
            "allocated": [],
            "message": f"System not in allocation mode (current: {phase})"
        })

    course = request.session.get('selected_course')
    seats = int(request.session.get('total_seats') or 0)

    if not course or seats <= 0:
        return JsonResponse({
            "allocated": [],
            "message": "Course or seats not configured"
        })

    allocated = []
    allocated_ids = set()

    # =========================
    # CORE ALLOCATION FUNCTION
    # =========================
    def process_students(student_list):

        nonlocal allocated, allocated_ids

        for student in student_list:

            if len(allocated) >= seats:
                return

            if student.id in allocated_ids:
                continue

            score = get_score(student, course)

            # seat available → allocate directly
            if len(allocated) < seats:

                student.is_allocated = True
                student.is_pending = False
                student.allocated_course = course
                student.save()

                allocated.append(student)
                allocated_ids.add(student.id)

    # =========================
    # PREF 1
    # =========================
    pref1 = list(Student.objects.filter(pref1=course))
    pref1.sort(key=lambda s: get_score(s, course), reverse=True)
    process_students(pref1)

    # =========================
    # PREF 2
    # =========================
    if len(allocated) < seats:
        pref2 = list(Student.objects.filter(pref2=course))
        pref2.sort(key=lambda s: get_score(s, course), reverse=True)
        process_students(pref2)

    # =========================
    # PREF 3
    # =========================
    if len(allocated) < seats:
        pref3 = list(Student.objects.filter(pref3=course))
        pref3.sort(key=lambda s: get_score(s, course), reverse=True)
        process_students(pref3)

    # =========================
    # RESPONSE (ALWAYS SAFE)
    # =========================
    result = []

    for student in allocated:
        result.append({
            "id": student.id,
            "name": student.name,
            "marks": student.marks,
            "score": get_score(student, course),
            "course": course
        })

    return JsonResponse({
        "allocated": result,
        "count": len(result),
        "message": "Allocation successful"
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
        


@login_required
def pending_candidates(request):

    course = request.session.get('selected_course')

    students = Student.objects.filter(
        is_pending=True,
        allocated_course__isnull=True
    )

    data = []
    for s in students:
        data.append({
            "id": s.id,
            "name": s.name,
            "marks": s.marks
        })

    return JsonResponse({"pending": data})
    


@csrf_exempt
def admin_decision(request):
    if request.method == "POST":

        data = json.loads(request.body)
        student_id = data.get("student_id")
        action = data.get("action")
        course = request.session.get('selected_course')

        student = Student.objects.get(id=student_id)

        # ------------------------
        # ACCEPT
        # ------------------------
        if action == "accept":
            student.is_pending = False
            student.is_allocated = True
            student.allocated_course = course
            student.save()

        # ------------------------
        # REJECT
        # ------------------------
        elif action == "reject":
            student.is_pending = False
            student.save()

        # ------------------------
        # REPLACE LOWEST
        # ------------------------
        elif action == "replace":

            allocated = Student.objects.filter(
                allocated_course=course,
                is_allocated=True
            ).order_by("marks").first()

            if allocated:
                allocated.is_allocated = False
                allocated.allocated_course = None
                allocated.save()

            student.is_pending = False
            student.is_allocated = True
            student.allocated_course = course
            student.save()

        return JsonResponse({"message": "done"})
    

def get_phase(request):
    return request.session.get("phase", "open")


def system_state(request):
    return JsonResponse({
        "phase": request.session.get("phase", "open"),
        "course": request.session.get("selected_course"),
        "seats": request.session.get("total_seats")
    })

@csrf_exempt
def set_phase(request):
    if request.method == "POST":
        phase = request.POST.get("phase")
        request.session["phase"] = phase

        return JsonResponse({
            "message": "Phase updated",
            "phase": phase
        })