create or replace function get_levels(in_user_id integer, in_order_id integer DEFAULT 1, in_order_dir integer DEFAULT 1, in_offset integer DEFAULT 0, in_limit integer DEFAULT 20, in_filter text DEFAULT NULL::text)
    returns TABLE(id integer, word character varying, word_count integer, solved integer, last_activity character varying, created_on timestamp without time zone)
    language plpgsql
as
$$
DECLARE
	query text;
	order_text text;
BEGIN
	IF in_order_id not in (SELECT lot.id FROM level_order_types lot) THEN
		RAISE EXCEPTION 'Недопустимый идентификатор сортировки (%). Допустимые идентификаторы: 1 - %',
			in_order_id, (SELECT max(lot.id) FROM level_order_types lot);
	END IF;

	IF in_offset < 0 THEN
		RAISE EXCEPTION 'Некорректный параметр offset (%)', in_offset;
	END IF;

	IF in_limit < 0 THEN
		RAISE EXCEPTION 'Некорректный параметр limit (%)', in_limit;
	END IF;

	order_text := (SELECT lo.val FROM level_orders lo WHERE lo.type_id = in_order_id and lo.dir_id = in_order_dir);

	query := '
		SELECT
			lvl.id,
			lvl.word,
			lvl.word_count,
			coalesce(sol.solved, 0)::integer as solved,
			coalesce(to_char(sol.last_activity, ''dd.mm.yyyy hh24:mi''), ''-'')::varchar as last_activity,
			lvl.created_on
		FROM
			(SELECT levels.id, words.word, levels.word_count, levels.created_on
			FROM levels, words
			WHERE ';

	if in_user_id is null then
        query := query || 'levels.available_for_guests and ';
    end if;

	if in_filter is not null then
        query := query || 'words.word like ''' || in_filter || '%'' and ';
    end if;

	query := query || 'levels.word_id = words.id
		) lvl LEFT JOIN
			(SELECT
				lw.level_id,
				count(*) as solved,
				max(us.created_on) as last_activity
			FROM
				user_solution us,
				level_word lw
			WHERE
	            us.user_id = $1 and
				us.level_word_id = lw.id
			GROUP BY lw.level_id
			) sol ON lvl.id = sol.level_id
		ORDER BY ' || order_text || '
		OFFSET $2 LIMIT $3
	';

	RETURN QUERY EXECUTE query USING in_user_id, in_offset, in_limit;
END
$$;

alter function get_levels(integer, integer, integer, integer, integer, text) owner to postgres;
