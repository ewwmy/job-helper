CREATE VIEW "vacancy_dynamics_latest" AS
SELECT
    headline_name,
    sphere_name,
    stack_name,
    MAX(date_check),
    avg_amount,
    abs_change,
    pct_change,
    base_abs_change,
    base_pct_change
FROM vacancy_dynamics
GROUP BY headline_name;
