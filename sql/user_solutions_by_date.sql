select date_count.user_id, auth_user.username, date_count.solve_date, date_count.words_solved
from (
    select date(created_on) as solve_date, count(*) as words_solved, user_id
    from user_solution
    group by date(created_on), user_id
) as date_count
    inner join auth_user on date_count.user_id = auth_user.id
order by date_count.solve_date desc;
