-- Structure --

CREATE TABLE "companies" (
	"id"	TEXT NOT NULL,
	"parent_id"	TEXT,
	"country_id"	TEXT,
	"name"	TEXT NOT NULL UNIQUE,
	"name_variants"	TEXT,
	"location"	TEXT,
	"description"	TEXT,
	"url"	TEXT,
	"source_url"	TEXT,
	"rating_dreamjob"	REAL,
	"is_hr_agency"	INTEGER NOT NULL DEFAULT 0,
	"is_favorite"	INTEGER NOT NULL DEFAULT 0,
	"is_blacklisted"	INTEGER NOT NULL DEFAULT 0,
	"date_blacklist_change"	TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
	"comment"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("country_id") REFERENCES "countries"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("parent_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE "contacts" (
	"id"	INTEGER NOT NULL,
	"company_id"	TEXT,
	"name"	TEXT NOT NULL,
	"name_variants"	TEXT,
	"position"	TEXT,
	"description"	TEXT,
	"phone"	TEXT,
	"phone_additional"	TEXT,
	"email"	TEXT,
	"email_additional"	TEXT,
	"telegram"	TEXT,
	"url"	TEXT,
	"is_blacklisted"	INTEGER NOT NULL DEFAULT 0,
	"time_blacklist_change"	TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
	"comment"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("company_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE countries (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    name_localized TEXT,
    flag TEXT
);

CREATE TABLE interview_statuses (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT,
    description TEXT
);

CREATE TABLE "interview_types" (
	"id"	TEXT NOT NULL,
	"name"	TEXT NOT NULL UNIQUE,
	"description"	TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE "interviews" (
	"id"	INTEGER NOT NULL,
	"vacancy_id"	TEXT,
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
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("contact_id") REFERENCES "contacts"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("status_id") REFERENCES "interview_statuses"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("type_id") REFERENCES "interview_types"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("vacancy_id") REFERENCES "vacancies"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE "projects" (
	"id"	TEXT NOT NULL,
	"name"	TEXT NOT NULL UNIQUE,
	"description"	TEXT,
	"time_start"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_end"	TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE sources (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    description TEXT
);

CREATE TABLE "vacancies" (
	"id"	TEXT NOT NULL,
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
	"url"	TEXT,
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
	"is_contacted_by_me"	INTEGER,
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

CREATE TABLE "vacancy_statuses" (
	"id"	TEXT NOT NULL,
	"title"	TEXT,
	"description"	TEXT,
	PRIMARY KEY("id")
);

CREATE TABLE vacancy_time_types (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT
);

CREATE TABLE vacancy_work_types (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT
);

-- Data --

INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('kg', 'Kyrgyzstan', 'Кыргызстан', '🇰🇬');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('ru', 'Russia', 'Россия', '🇷🇺');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('uz', 'Uzbekistan', 'Узбекистан', '🇺🇿');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('us', 'USA', 'США', '🇺🇸');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('de', 'Germany', 'Германия', '🇩🇪');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('ph', 'Philippines', 'Филиппины', '🇵🇭');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('nl', 'Netherlands', 'Нидерланды', '🇳🇱');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('es', 'Spain', 'Испания', '🇪🇸');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('pt', 'Portugal', 'Португалия', '🇵🇹');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('cy', 'Cyprus', 'Кипр', '🇨🇾');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('kz', 'Kazakhstan', 'Казахстан', '🇰🇿');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('pl', 'Poland', 'Польша', '🇵🇱');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('uk', 'UK', 'Великобритания', '🇬🇧');
INSERT INTO "countries" ("id", "name", "name_localized", "flag") VALUES ('ae', 'UAE', 'Объединённые Арабские Эмираты', '🇦🇪');

INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('draft', 'Черновик', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('planned', 'Запланировано', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('pending', 'В ожидании результата', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('passed', 'Пройдено', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('rejected', 'Не пройдено', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('cancelled_by_company', 'Отменено компанией', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('cancelled_by_me', 'Отменено мной', NULL);
INSERT INTO "interview_statuses" ("id", "title", "description") VALUES ('vanished', 'Пропали', 'Прекратил ждать ввиду отсутствия обратной связи.
По сути то же, что `rejected`, но когда долго молчат,
не дают обратную связь, пропадают и т.д.');

INSERT INTO "interview_types" ("id", "name", "description") VALUES ('hr', 'HR-интервью', NULL);
INSERT INTO "interview_types" ("id", "name", "description") VALUES ('technical', 'Техническое интервью', NULL);
INSERT INTO "interview_types" ("id", "name", "description") VALUES ('final', 'Финальное интервью', 'Сюда входят собесы с руководителем, командой (после успешного прохождения технического этапа) и т.д.');

INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('hh', 'HeadHunter', 'https://hh.ru/', 'HH');
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('superjob', 'SuperJob', 'https://www.superjob.ru/', 'SuperJob');
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('habr', 'Habr Career', 'https://career.habr.com/', 'Хабр-Карьера');
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('getmatch', 'getmatch', 'https://getmatch.ru/', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('linkedin', 'LinkedIn', 'https://www.linkedin.com/', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('nofluffjobs', 'NoFluffJobs', 'https://nofluffjobs.com/nl/?lang=ru', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('indeed', 'Indeed', 'https://www.indeed.com/', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('seek', 'Seek', 'https://www.seek.co.nz/', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('glassdoor', 'GLASSDOOR', 'https://www.glassdoor.com/', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('wellfound', 'Wellfound', 'https://wellfound.com/jobs', NULL);
INSERT INTO "sources" ("id", "name", "url", "description") VALUES ('remocate', 'Remocate', 'https://www.remocate.app/', NULL);

INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('draft', 'Черновик', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('applied', 'Отправил отклик', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('progress', 'Интервьюирование', 'Инициирован контакт, назначено собеседование');
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('canceled', 'Я отклонил эту вакансию', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('rejected', 'Работодатель отклонил мою кандидатуру', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('offer_given', 'Получен оффер', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('offer_canceled', 'Я отклонил оффер', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('offer_accepted', 'Оффер принят', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('apply_required', 'Требуется отправить резюме', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('offer_rejected', 'Работодатель отозвал оффер', NULL);
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('pending', 'Ожидание обратной связи от работодателя', 'Собеседование пройдено, ожидается обратная связь от работодателя');
INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('vanished', 'Пропали', 'Прекратил ждать ввиду отсутствия обратной связи.
По сути то же, что `rejected`, но когда долго молчат,
не дают обратную связь, пропадают и т.д.');

INSERT INTO "vacancy_time_types" ("id", "title") VALUES ('full-time', 'Полный рабочий день');
INSERT INTO "vacancy_time_types" ("id", "title") VALUES ('part-time', 'Неполный рабочий день');
INSERT INTO "vacancy_time_types" ("id", "title") VALUES ('contract', 'Контракт');
INSERT INTO "vacancy_time_types" ("id", "title") VALUES ('project', 'Проект');

INSERT INTO "vacancy_work_types" ("id", "title") VALUES ('on-site', 'Офис');
INSERT INTO "vacancy_work_types" ("id", "title") VALUES ('hybrid', 'Гибрид');
INSERT INTO "vacancy_work_types" ("id", "title") VALUES ('remote', 'Удаленно');
