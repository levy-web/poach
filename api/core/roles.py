"""
Role resolution and the one-role-per-person rule.

A person's role is an attachment (VendorProfile / RunnerProfile) rather than
a column on User, so "what role is this?" is a lookup rather than a field
read. The mobile app routes its entire tab set off the answer, which is why
holding two roles at once is rejected: there would be no defined home screen
for such a user.
"""

CUSTOMER = "customer"
VENDOR = "vendor"
RUNNER = "runner"

# The profile attribute each role attaches to User under, and the role that
# conflicts with it. Kept as data so both the model `clean()` hooks and the
# serializers enforce the same rule from one place.
_ROLE_ATTRS = {
    RUNNER: "runner_profile",
    VENDOR: "vendor_profile",
}
_CONFLICTS = {VENDOR: RUNNER, RUNNER: VENDOR}


def role_for(user):
    """
    The user's role, checked runner-first only because the two are mutually
    exclusive — the order is arbitrary, not a precedence.
    """
    for role, attr in _ROLE_ATTRS.items():
        # hasattr() on a reverse one-to-one is False when no profile exists.
        if hasattr(user, attr):
            return role
    return CUSTOMER


def conflicting_role(user, claiming):
    """
    The role `user` already holds that blocks them from taking `claiming`,
    or None if they're free to take it.
    """
    if user is None:
        return None
    other = _CONFLICTS[claiming]
    return other if hasattr(user, _ROLE_ATTRS[other]) else None


def conflict_message(claiming, held):
    return (
        f"This account is already a {held}. A person can hold only one role — "
        f"remove their {held} profile before making them a {claiming}."
    )
