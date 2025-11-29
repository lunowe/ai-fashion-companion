FROM python:3.11

WORKDIR /code

COPY ./backend/requirements.txt /code/requirements.txt

# Mount pip cache directory
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade -r /code/requirements.txt

COPY ./backend /code

CMD ["fastapi", "run", "backend/main.py", "--port", "8000"]