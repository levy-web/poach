import re

PHONE_REGEX = re.compile(r"^\+[1-9]\d{1,14}$")

# Kenya-only convenience: accepts what people actually type (070..., 254...)
# and normalizes to E.164 before validation/storage. Extend this if other
# country codes need support.
KENYA_LOCAL_REGEX = re.compile(r"^0(\d{9})$")
KENYA_NO_PLUS_REGEX = re.compile(r"^254(\d{9})$")


def normalize_phone_number(value):
    value = value.strip().replace(" ", "").replace("-", "")

    local_match = KENYA_LOCAL_REGEX.match(value)
    if local_match:
        return f"+254{local_match.group(1)}"

    no_plus_match = KENYA_NO_PLUS_REGEX.match(value)
    if no_plus_match:
        return f"+254{no_plus_match.group(1)}"

    return value
