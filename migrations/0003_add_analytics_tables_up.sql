CREATE TABLE vacancy_analytics_hedalines (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL UNIQUE,
  "lang" TEXT,
  "sphere" TEXT,
  "stack" TEXT,
  "is_active" INTEGER NOT NULL DEFAULT 1,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id")
);

CREATE TABLE vacancy_analytics (
  "id" INTEGER NOT NULL,
  "headline_id" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "date_check" TEXT NOT NULL DEFAULT CURRENT_DATE,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
  PRIMARY KEY("id" AUTOINCREMENT),
  FOREIGN KEY("headline_id") REFERENCES "vacancy_analytics_hedalines"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
