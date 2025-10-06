FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY servera_rest.py .

EXPOSE 6001

CMD ["python", "servera_rest.py"]
