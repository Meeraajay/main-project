from django.shortcuts import render, redirect
from .models import Student

# Create your views here.
def index(request):
    return render(request, 'index.html')
    

def studentdash(request):
    return render(request, 'studentdash.html')

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