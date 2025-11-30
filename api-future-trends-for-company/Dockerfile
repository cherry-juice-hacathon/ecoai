# syntax=docker/dockerfile:1.7
ARG PYTHON_IMAGE=python:3.12-slim

FROM ${PYTHON_IMAGE} AS builder
WORKDIR /tmp/build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gfortran libopenblas-dev liblapack-dev && \
    rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN pip install --no-cache-dir --prefix=/opt/venv -r requirements.txt

FROM ${PYTHON_IMAGE} AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
RUN apt-get update && \
    apt-get install -y --no-install-recommends libopenblas-dev liblapack-dev && \
    rm -rf /var/lib/apt/lists/*
COPY --from=builder /opt/venv /usr/local
COPY . .
EXPOSE 5000
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
