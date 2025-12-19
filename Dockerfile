# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /code

# Copy files
COPY . /code

# Install requirements
RUN pip install --no-cache-dir -r requirements.txt

# Expose port for HF
EXPOSE 7860

# Run Flask
ENV PORT=7860
ENV FLASK_APP=app.py

CMD ["python", "app.py"]
