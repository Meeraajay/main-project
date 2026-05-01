from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'index.html')

def studentdash(request):
    return render(request, 'studentdash.html')