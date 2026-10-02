.PHONY: test lint test-backend test-frontend lint-backend lint-frontend dev

test: test-backend test-frontend

test-backend:
	cd backend && venv/Scripts/python -m pytest -q

test-frontend:
	cd frontend && npm run test

lint: lint-backend lint-frontend

lint-backend:
	cd backend && venv/Scripts/python -m compileall -q config events

lint-frontend:
	cd frontend && npm run lint

dev:
	docker compose up --build
