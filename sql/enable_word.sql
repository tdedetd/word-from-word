-- DROP FUNCTION public.enable_word(integer);

create function enable_word(in_word_id int) returns int as $$
DECLARE
	gotten_word text;
	level_ids integer[];
BEGIN
	IF NOT EXISTS (SELECT * FROM words w WHERE w.id = in_word_id) THEN
		RAISE EXCEPTION 'Указан неверный id слова (%)', in_word_id;
	END IF;

	-- получение слова по id
	SELECT w.word
	INTO gotten_word
	FROM words w
	WHERE w.id = in_word_id;
	
	-- получение списка уровней, для которых подходит указанное слово
	level_ids := array(
		SELECT l.id
		FROM levels l, words w
		WHERE includes(w.word, 'аи') and l.word_id = w.id
	);
	
	-- добавление слова в подходящие слова для полученных уровней
	INSERT INTO level_word (level_id, word_id)
	SELECT l, in_word_id
	FROM unnest(level_ids) as l;

	-- инкрементирование общего кол-ва слов для полученных уровней
	UPDATE levels
	SET word_count = word_count + 1
	WHERE array[id] <@ level_ids;

	RETURN 1;
	
END
$$
language plpgsql