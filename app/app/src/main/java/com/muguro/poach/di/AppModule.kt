package com.muguro.poach.di

import android.content.Context
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.helpers.PreferenceUtil
import com.muguro.poach.helpers.SessionManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class AppModule {

    @Provides
    @Singleton
    fun providePreferenceUtil(@ApplicationContext context: Context): PreferenceUtil =
        PreferenceUtil(context)

    @Provides
    @Singleton
    fun provideSessionManager(preferenceUtil: PreferenceUtil): SessionManager =
        SessionManager(preferenceUtil)

    @Provides
    @Singleton
    fun providePoachApi(
        @ApplicationContext context: Context,
        sessionManager: SessionManager,
    ): PoachAPI = PoachAPI(context, sessionManager)
}
