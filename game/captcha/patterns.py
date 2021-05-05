from random import choice


def max_length(words):
    words = words.copy()
    message = 'Введите самое длинное слово из перечисленных ниже'
    words.sort(key=lambda w: len(w), reverse=True)
    answer = words[0]

    words_lengths = list(map(lambda w: len(w), words))
    return message, answer, words_lengths[0] != words_lengths[1]


def min_length(words):
    words = words.copy()
    message = 'Введите самое короткое слово из перечисленных ниже'
    words.sort(key=lambda w: len(w))
    answer = words[0]

    words_lengths = list(map(lambda w: len(w), words))
    return message, answer, words_lengths[0] != words_lengths[1]


def max_letter_frequency(words):
    words_freq = get_frequency(words)
    letter_freq = []
    for word_freq in words_freq:
        for letter, count in word_freq['freq'].items():
            letter_freq.append({
                'word': word_freq['word'],
                'letter': letter,
                'count': count
            })
    letter_freq.sort(key=lambda l: l['count'], reverse=True)
    max_freq = letter_freq[0]['count']
    letter_freq = list(filter(lambda l: l['count'] == max_freq, letter_freq))

    unique_letters_freq = []
    for lf1 in letter_freq:
        unique = True
        for lf2 in letter_freq:
            if lf1 != lf2 and lf1['letter'] == lf2['letter']:
                unique = False

        if unique:
            unique_letters_freq.append(lf1)

    if len(unique_letters_freq) == 0:
        return '', '', False

    task_row = choice(unique_letters_freq)
    message = 'Введите слово, в котором чаще всего встречается буква "%s"' % task_row['letter']
    answer = task_row['word']
    return message, answer, True


def get_frequency(words):
    words_freq = list(map(lambda w: { 'word': w, 'freq': {} }, words))
    for word_freq in words_freq:
        for letter in word_freq['word']:
            if letter in word_freq['freq']:
                word_freq['freq'][letter] += 1
            else:
                word_freq['freq'][letter] = 1
    return words_freq
