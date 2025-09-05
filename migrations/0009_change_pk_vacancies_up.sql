ROLLBACK;

PRAGMA foreign_keys = OFF;

BEGIN;

CREATE TEMP TABLE "id_map" AS
SELECT "id" AS "old_id", "rowid" AS "new_id"
FROM "vacancies";

UPDATE "interviews"
SET "vacancy_id" = (
  SELECT "new_id" FROM "id_map" WHERE "old_id" = "interviews"."vacancy_id"
);

UPDATE "vacancies"
SET "id" = (
  SELECT "new_id" FROM "id_map" WHERE "old_id" = "vacancies"."id"
);

CREATE TABLE "vacancies_new" (
	"id"	INTEGER NOT NULL,
	"project_id"	TEXT,
	"company_id"	TEXT,
	"hr_agency_id"	TEXT,
	"contact_id"	INTEGER,
	"status_id"	TEXT NOT NULL DEFAULT 'draft',
	"work_type_id"	TEXT,
	"time_type_id"	TEXT,
	"source_id"	TEXT,
	"location"	TEXT,
	"name"	TEXT NOT NULL,
	"url"	TEXT UNIQUE,
	"description"	TEXT,
	"salary_from"	REAL,
	"salary_to"	REAL,
	"currency"	TEXT,
	"cover_letter"	TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
	"date_status_change"	TEXT,
	"date_publication"	TEXT,
	"date_first_contact"	TEXT,
	"date_archived"	TEXT,
	"is_favorite"	INTEGER NOT NULL DEFAULT 0,
	"communication_log"	TEXT,
	"comment"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("company_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("contact_id") REFERENCES "contacts"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("hr_agency_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("project_id") REFERENCES "projects"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("source_id") REFERENCES "sources"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("status_id") REFERENCES "vacancy_statuses"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("time_type_id") REFERENCES "vacancy_time_types"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("work_type_id") REFERENCES "vacancy_work_types"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT INTO "vacancies_new" SELECT * FROM "vacancies";
DROP TABLE "vacancies";
ALTER TABLE "vacancies_new" RENAME TO "vacancies";

CREATE TABLE "interviews_new" (
	"id"	INTEGER NOT NULL,
	"vacancy_id"	INTEGER,
	"type_id"	TEXT,
	"status_id"	TEXT NOT NULL DEFAULT 'draft',
	"contact_id"	INTEGER,
	"step"	INTEGER,
	"name"	TEXT NOT NULL,
	"description"	TEXT,
	"date_status_change"	TEXT,
	"time_start"	TEXT,
	"time_end"	TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
	"my_evaluation"	TEXT,
	"company_evaluation"	TEXT,
	"url"	TEXT,
	"comment"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("contact_id") REFERENCES "contacts"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("status_id") REFERENCES "interview_statuses"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("type_id") REFERENCES "interview_types"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("vacancy_id") REFERENCES "vacancies"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT INTO "interviews_new" SELECT * FROM "interviews";
DROP TABLE "interviews";
ALTER TABLE "interviews_new" RENAME TO "interviews";

DROP TABLE "id_map";

COMMIT;

PRAGMA foreign_keys = ON;

BEGIN;
