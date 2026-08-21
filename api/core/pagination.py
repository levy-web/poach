from rest_framework.pagination import PageNumberPagination


class OptInPageNumberPagination(PageNumberPagination):
    """
    Paginates only when the caller asks for it.

    The vendor/runner list endpoints already serve the mobile apps, which
    expect a plain JSON array. Setting a normal pagination class — or the
    project-wide DEFAULT_PAGINATION_CLASS — would silently wrap those
    responses in a {count, next, previous, results} envelope and break every
    existing caller.

    Returning None from `paginate_queryset` makes DRF's ListModelMixin fall
    back to serializing the full queryset, so a request without `page` or
    `page_size` behaves exactly as it did before.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        asked_for_pagination = (
            self.page_query_param in request.query_params
            or self.page_size_query_param in request.query_params
        )
        if not asked_for_pagination:
            return None
        return super().paginate_queryset(queryset, request, view)
