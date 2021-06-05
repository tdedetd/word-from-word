update auth_user set rating = (
    select coalesce(sum(lp.p), 0)
    from (
        select get_total_points_from_level(uc.words_solved::integer, l.word_count) as p
        from (
            select lw.level_id, count(*) as words_solved
            from user_solution us
                join level_word lw on us.level_word_id = lw.id
            where us.user_id = auth_user.id
            group by lw.level_id
        ) uc join levels l on l.id = uc.level_id
    ) lp
);
