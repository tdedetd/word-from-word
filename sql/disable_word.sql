DROP FUNCTION public.disable_word(integer);

create function disable_word(in_word_id int) returns int as $$
DECLARE
	level_word_ids integer[];
	level_ids integer[];
BEGIN
	-- получение списка подходящих слов для уровней, содержащих данное слово
	-- 642 аи
	level_word_ids = array(
		SELECT lw.id
		FROM level_word lw
		WHERE lw.word_id = in_word_id
	);

	-- получение списка уровней
	level_ids = array(
		SELECT lw.level_id
		FROM level_word lw
		WHERE lw.word_id = in_word_id
	);
	
	-- удаление слова из таблицы решений
	DELETE FROM user_solution
	WHERE array[user_solution.level_word_id] <@ level_word_ids;
	
	-- удаление слова из таблицы подходящих слов
	DELETE FROM level_word
	WHERE array[level_word.id] <@ level_word_ids;
	
	-- декремент общего количества слов из уровней слова
	UPDATE levels
	SET word_count = word_count - 1
	WHERE array[id] <@ level_ids;

	RETURN 1;

END
$$
language plpgsql