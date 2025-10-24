CREATE VIEW "applications_analytics" AS
SELECT
  COUNT(
    CASE
	  WHEN "status_id" <> 'draft' THEN 1
	  ELSE NULL
	END
  ) AS "cnt_total",
  (
    SELECT ROUND(AVG("weekly_cnt"), 2)
    FROM (
      SELECT COUNT("id") AS "weekly_cnt"
      FROM "vacancies"
      WHERE "project_id" = '2025node' AND "status_id" <> 'draft'
      GROUP BY strftime('%Y-%W', "date_first_contact")
    )
  ) AS "avg_cnt_week",
  COUNT(
    CASE
	  WHEN "status_id" = 'progress' THEN 1
	  ELSE NULL
	END
  ) AS "cnt_progress",
  COUNT(
    CASE
	  WHEN "status_id" = 'rejected' THEN 1
	  ELSE NULL
	END
  ) AS "cnt_rejected",
  COUNT(
    CASE
	  WHEN "status_id" = 'applied' THEN 1
	  ELSE NULL
	END
  ) AS "cnt_applied",
  COUNT(
    CASE
	  WHEN "is_contacted_by_me" = 0 THEN 1
	  ELSE NULL
	END
  ) AS "cnt_proposed_total",
  MIN("date_first_contact") AS "date_first_application",
  (
    CAST(julianday(CURRENT_DATE) - julianday("date_first_contact") AS INTEGER)
  ) AS "days_search"
FROM "vacancies"
WHERE
  "project_id" = '2025node';
