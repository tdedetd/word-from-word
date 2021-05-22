create function submit_word_guest(in_level_id integer, in_word character varying)
    returns TABLE(key character varying, val integer)
    language plpgsql
as
$$
DECLARE
	calc_word_id integer;
	calc_level_word_id integer;

	success integer = 1;
	reward real = null;
BEGIN
	in_word := lower(in_word);

	-- Проверка на существование слова
	calc_word_id := (SELECT words.id FROM words WHERE words.word = in_word);

	IF calc_word_id is null THEN
		success := 0;
	END IF;

	-- Проверка на подходимость слова
	IF success = 1 THEN
		calc_level_word_id :=  (
			SELECT lw.id
			FROM level_word lw
			WHERE lw.level_id = in_level_id and lw.word_id = calc_word_id
		);

		IF calc_level_word_id is null THEN
			success := 0;
		END IF;
	END IF;

	key := 'success';
	val := success;
	RETURN NEXT;

	key := 'reward';
	val := reward;
	RETURN NEXT;
END
$$;

alter function submit_word_guest(integer, integer, varchar) owner to postgres;
