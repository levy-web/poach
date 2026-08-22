package com.muguro.poach.ui.screens.main.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.api.models.MenuItem
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.math.BigDecimal
import javax.inject.Inject

/**
 * Chips above the listing. Search is answered by the backend; these narrow
 * or reorder what came back, so switching one doesn't cost a round trip.
 */
enum class DishFilter(val label: String) {
    All("All"),
    Budget("Budget friendly"),
    LowestPrice("Lowest price"),
    Alphabetical("A–Z"),
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val poachApi: PoachAPI,
) : ViewModel() {

    val query = mutableStateOf("")
    val filter = mutableStateOf(DishFilter.All)
    val isLoading = mutableStateOf(false)
    val error = mutableStateOf<String?>(null)

    private val allDishes = mutableStateOf<List<MenuItem>>(emptyList())

    /** What the list actually renders — [allDishes] with [filter] applied. */
    val dishes = mutableStateOf<List<MenuItem>>(emptyList())

    private var searchJob: Job? = null

    init {
        load()
    }

    fun onQueryChange(value: String) {
        query.value = value
        // Debounced so typing doesn't fire a request per keystroke; the
        // pending job is cancelled on every new character.
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(SEARCH_DEBOUNCE_MS)
            load()
        }
    }

    fun clearQuery() {
        searchJob?.cancel()
        query.value = ""
        load()
    }

    fun onFilterChange(value: DishFilter) {
        filter.value = value
        applyFilter()
    }

    fun load() {
        viewModelScope.launch {
            isLoading.value = true
            error.value = null
            poachApi.getMenuItems(query.value)
                .onSuccess { allDishes.value = it; applyFilter() }
                .onFailure {
                    allDishes.value = emptyList()
                    dishes.value = emptyList()
                    error.value = it.message ?: "Couldn't load dishes."
                }
            isLoading.value = false
        }
    }

    private fun applyFilter() {
        val items = allDishes.value
        dishes.value = when (filter.value) {
            DishFilter.All -> items
            DishFilter.Budget -> items.filter { it.priceOrZero() <= BUDGET_CEILING }
            DishFilter.LowestPrice -> items.sortedBy { it.priceOrZero() }
            DishFilter.Alphabetical -> items.sortedBy { it.dish_name.lowercase() }
        }
    }

    // Prices arrive as decimal strings; anything unparseable sorts as free
    // rather than crashing the list.
    private fun MenuItem.priceOrZero(): BigDecimal =
        price.toBigDecimalOrNull() ?: BigDecimal.ZERO

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
        val BUDGET_CEILING: BigDecimal = BigDecimal(300)
    }
}
