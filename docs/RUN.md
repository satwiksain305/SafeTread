# How to Run SafeTread

## Start Backend (Terminal 1)
```powershell
cd C:\Users\satwi\OneDrive\Desktop\SafeTread
.\.venv\Scripts\python.exe app.py
```
Backend runs on: **http://127.0.0.1:5000**

## Start Frontend (Terminal 2)
```powershell
cd C:\Users\satwi\OneDrive\Desktop\SafeTread\frontend\build
python -m http.server 3000
```
Frontend runs on: **http://localhost:3000**

## That's it!
Open http://localhost:3000 in your browser and start analyzing tyres.

---

**Note:** Backend currently uses mock predictions. To enable real TensorFlow model, free up 500MB on C: drive and run:
```powershell
.\.venv\Scripts\python.exe -m pip install tensorflow
```
