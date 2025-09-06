CREATE VIEW "vacancy_dynamics" AS
SELECT
    "v"."headline_name" AS "headline_name",
    "v"."sphere_name" AS "sphere_name",
    "v"."stack_name" AS "stack_name",
    "v"."date_check" AS "date_check",
    ROUND("v"."avg_amount", 2) AS "avg_amount",

    -- absolute daily change
    ROUND("v"."avg_amount" - LAG("v"."avg_amount") OVER (
        PARTITION BY "v"."headline_name" 
        ORDER BY "v"."date_check"
    ), 2) AS "abs_change",

    -- percentage of daily change
    CASE 
        WHEN LAG("v"."avg_amount") OVER (
            PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
        ) IS NULL 
            THEN NULL
        WHEN LAG("v"."avg_amount") OVER (
            PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
        ) = 0
            THEN NULL
        ELSE
            ROUND(
                (
                    ("v"."avg_amount" - LAG("v"."avg_amount") OVER (
                        PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
                    ))
                    / LAG("v"."avg_amount") OVER (
                        PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
                    )
                ) * 100,
            2) || '%'
    END AS "pct_change",
	
    -- base period change
    CASE 
        WHEN FIRST_VALUE("v"."avg_amount") OVER (
            PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
        ) = 0
            THEN NULL
        ELSE
            ROUND(
                "v"."avg_amount" - FIRST_VALUE("v"."avg_amount") OVER (
                    PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
                ),
            2)
    END AS "base_abs_change",

    -- percentage of base period change
    CASE 
        WHEN FIRST_VALUE("v"."avg_amount") OVER (
            PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
        ) = 0
            THEN NULL
        ELSE
            ROUND(
                (
                    ("v"."avg_amount" - FIRST_VALUE("v"."avg_amount") OVER (
                        PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
                    ))
                    / FIRST_VALUE("v"."avg_amount") OVER (
                        PARTITION BY "v"."headline_name" ORDER BY "v"."date_check"
                    )
                ) * 100,
            2) || '%'
    END AS "base_pct_change"

FROM "vacancy_stats_daily" AS "v"
ORDER BY "v"."headline_name", "v"."date_check";
