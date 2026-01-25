import { apiAuth, api } from './api-client';

/**
 * OAuth helper functions for social media integration
 */

export const oauthAPI = {
  /**
   * Get Facebook authorization URL
   */
  async getFacebookAuthUrl() {
    try {
      const response = await apiAuth('/oauth/facebook/authorize', {
        method: 'GET'
      });
      return response;
    } catch (err) {
      console.error('getFacebookAuthUrl error:', err);
      throw err;
    }
  },

  /**
   * Get Twitter authorization URL
   */
  async getTwitterAuthUrl() {
    try {
      const response = await apiAuth('/oauth/twitter/authorize', {
        method: 'GET'
      });
      return response;
    } catch (err) {
      console.error('getTwitterAuthUrl error:', err);
      throw err;
    }
  },

  /**
   * Get connected social media providers
   * Uses the social-media stats endpoint which returns connection status
   */
  async getConnectedProviders() {
    try {
      const response = await apiAuth('/api/social-media/stats', {
        method: 'GET'
      });

      // Transform the response to match expected format
      // The stats endpoint returns { facebook: {...}, twitter: {...} }
      // We need to add a 'connected' flag based on whether data exists
      const providers = {};
      if (response.data) {
        if (response.data.facebook) {
          providers.facebook = { connected: true, ...response.data.facebook };
        } else {
          providers.facebook = { connected: false };
        }

        if (response.data.twitter) {
          providers.twitter = { connected: true, ...response.data.twitter };
        } else {
          providers.twitter = { connected: false };
        }
      }

      return { data: providers };
    } catch (err) {
      console.error('getConnectedProviders error:', err);
      // If error, assume not connected
      return {
        data: {
          facebook: { connected: false },
          twitter: { connected: false }
        }
      };
    }
  },

  /**
   * Unlink OAuth provider
   * @param {string} provider - 'facebook' or 'twitter'
   */
  async unlinkProvider(provider) {
    try {
      const response = await apiAuth(`/oauth/unlink/${provider}`, {
        method: 'DELETE'
      });
      return response;
    } catch (err) {
      console.error(`unlinkProvider (${provider}) error:`, err);
      throw err;
    }
  },

  /**
   * Disconnect OAuth provider (alias for unlinkProvider)
   * @param {string} provider - 'facebook' or 'twitter'
   */
  async disconnectProvider(provider) {
    return this.unlinkProvider(provider);
  },

  /**
   * Get Jira authorization URL
   */
  async getJiraAuthUrl() {
    try {
      const response = await apiAuth('/oauth/jira/authorize', {
        method: 'GET'
      });
      return response;
    } catch (err) {
      console.error('getJiraAuthUrl error:', err);
      throw err;
    }
  },

  /**
   * Get Google Calendar authorization URL
   */
  async getGoogleCalendarAuthUrl() {
    try {
      const response = await apiAuth('/oauth/google-calendar/authorize', {
        method: 'GET'
      });
      return response;
    } catch (err) {
      console.error('getGoogleCalendarAuthUrl error:', err);
      throw err;
    }
  },

  /**
   * Get Microsoft Calendar authorization URL
   */
  async getMicrosoftCalendarAuthUrl() {
    try {
      const response = await apiAuth('/oauth/microsoft/authorize', {
        method: 'GET'
      });
      return response;
    } catch (err) {
      console.error('getMicrosoftCalendarAuthUrl error:', err);
      throw err;
    }
  }
};
