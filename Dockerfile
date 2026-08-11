FROM python:3.12-slim

WORKDIR /app
COPY . .

ENV HOST=0.0.0.0
ENV PORT=8765
EXPOSE 8765

CMD ["sh", "-c", "python server.py --host 0.0.0.0 --port ${PORT:-8765}"]
