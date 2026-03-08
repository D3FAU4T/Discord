import math

def split_words_into_columns(words: list[str]) -> tuple[list[str], list[str], list[str]]:
    """Split a flat list of words into 3 columns based on array length.
    
    Args:
        words: Flat list of words sorted by length then alphabetically
        
    Returns:
        Tuple of (column1, column2, column3) lists
    """
    array_length = len(words)
    
    # Calculate split index based on array length
    if array_length < 21:
        if array_length > 14:
            split_index = math.ceil((array_length - 4) / 2)
        else:
            split_index = math.ceil(array_length / 3)
    elif array_length > 27:
        split_index = 10
    elif array_length > 21:
        split_index = 9
    else:
        split_index = 8
    
    # Split into 3 columns
    column1 = words[0:split_index]
    column2 = words[split_index:2 * split_index]
    column3 = words[2 * split_index:]
    
    return column1, column2, column3
