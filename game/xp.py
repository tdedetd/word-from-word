
def get_xp_required(level):
    """
    Возвращает количество требуемых очков для поднятия указанного уровня
    """
    return 30 * (level - 1) ** 1.3


def get_xp_info(points):
    """
    Возвращает информацию о рейтинге игрока:
    - текущий уровень
    - текущее количество очков внутри уровня
    - количество очков, необходимое для повышеия уровня
    """
    level = 0
    points_needed = get_xp_required(level + 1)
    
    while points >= points_needed:
        points = points - points_needed
        level = level + 1
        points_needed = get_xp_required(level + 1)

    return {
        'level': level,
        'points_current': int(points),
        'points_needed': int(points_needed),
    }
