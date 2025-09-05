CREATE TABLE vacancy_analytics_spheres (
  "id" TEXT NOT NULL,
  "group" TEXT,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id")
);

CREATE TABLE vacancy_analytics_stack (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id")
);

CREATE TABLE vacancy_analytics_headlines (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "sphere_id" TEXT,
  "stack_id" TEXT,
  "lang" TEXT,
  "is_active" INTEGER NOT NULL DEFAULT 1,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id"),
  FOREIGN KEY("sphere_id") REFERENCES "vacancy_analytics_spheres"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY("stack_id") REFERENCES "vacancy_analytics_stack"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE vacancy_analytics_sources (
  "id" TEXT NOT NULL,
  "is_active" INTEGER NOT NULL DEFAULT 1,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id"),
  FOREIGN KEY("id") REFERENCES "sources"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE vacancy_analytics (
  "id" INTEGER NOT NULL,
  "headline_id" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "amount" INTEGER,
  "date_check" TEXT NOT NULL DEFAULT CURRENT_DATE,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id"),
  FOREIGN KEY("headline_id") REFERENCES "vacancy_analytics_headlines"("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY("source_id") REFERENCES "vacancy_analytics_sources"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);
