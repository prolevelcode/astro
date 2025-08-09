import axios from 'axios';

const PROKERALA_BASE_URL = 'https://api.prokerala.com/v2';
const CLIENT_ID = process.env.PROKERALA_CLIENT_ID!;
const CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET!;

interface BirthDetails {
  dob: string;
  time?: string;
  place: string;
  gender: string;
  timeUnknown?: boolean;
  latitude?: number;
  longitude?: number;
}

interface PartnerDetails extends BirthDetails {
  partnerName?: string;
  partnerDob?: string;
  partnerTime?: string;
  partnerPlace?: string;
  partnerGender?: string;
  partnerTimeUnknown?: boolean;
}

class ProkeralaAPI {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${PROKERALA_BASE_URL}/token`,
        {
          grant_type: 'client_credentials',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken!;
    } catch (error) {
      console.error('Failed to get Prokerala access token:', error);
      throw new Error('Authentication failed');
    }
  }

  private async makeApiCall(endpoint: string, params: any) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(`${PROKERALA_BASE_URL}${endpoint}`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Prokerala API call failed for ${endpoint}:`, error);
      throw new Error('API call failed');
    }
  }

  private parseCoordinates(place: string): { lat: number; lon: number } {
    // For now, return default coordinates for major cities
    // In production, you'd use a geocoding service
    const cityCoordinates: { [key: string]: { lat: number; lon: number } } = {
      'mumbai': { lat: 19.0760, lon: 72.8777 },
      'delhi': { lat: 28.7041, lon: 77.1025 },
      'bangalore': { lat: 12.9716, lon: 77.5946 },
      'chennai': { lat: 13.0827, lon: 80.2707 },
      'kolkata': { lat: 22.5726, lon: 88.3639 },
      'pune': { lat: 18.5204, lon: 73.8567 },
      'ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'hyderabad': { lat: 17.3850, lon: 78.4867 },
    };

    const normalizedPlace = place.toLowerCase();
    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (normalizedPlace.includes(city)) {
        return coords;
      }
    }

    // Default to Mumbai if city not found
    return { lat: 19.0760, lon: 72.8777 };
  }

  private formatDateTime(dob: string, time?: string): string {
    if (!time) {
      return `${dob} 12:00:00`;
    }
    return `${dob} ${time}:00`;
  }

  async getBirthChart(birthDetails: BirthDetails) {
    const coords = this.parseCoordinates(birthDetails.place);
    const datetime = this.formatDateTime(birthDetails.dob, birthDetails.time);

    return await this.makeApiCall('/astrology/birth-chart', {
      datetime,
      coordinates: `${coords.lat},${coords.lon}`,
      chart_style: 'north-indian',
    });
  }

  async getKundliMatching(userDetails: BirthDetails, partnerDetails: PartnerDetails) {
    const userCoords = this.parseCoordinates(userDetails.place);
    const partnerCoords = this.parseCoordinates(partnerDetails.partnerPlace || partnerDetails.place);
    
    const userDatetime = this.formatDateTime(userDetails.dob, userDetails.time);
    const partnerDatetime = this.formatDateTime(
      partnerDetails.partnerDob || partnerDetails.dob, 
      partnerDetails.partnerTime || partnerDetails.time
    );

    return await this.makeApiCall('/astrology/kundli-matching', {
      girl_dob: userDetails.gender === 'female' ? userDatetime : partnerDatetime,
      girl_coordinates: userDetails.gender === 'female' ? `${userCoords.lat},${userCoords.lon}` : `${partnerCoords.lat},${partnerCoords.lon}`,
      boy_dob: userDetails.gender === 'male' ? userDatetime : partnerDatetime,
      boy_coordinates: userDetails.gender === 'male' ? `${userCoords.lat},${userCoords.lon}` : `${partnerCoords.lat},${partnerCoords.lon}`,
    });
  }

  async getDailyHoroscope(birthDetails: BirthDetails) {
    const coords = this.parseCoordinates(birthDetails.place);
    const datetime = this.formatDateTime(birthDetails.dob, birthDetails.time);

    return await this.makeApiCall('/astrology/daily-horoscope', {
      datetime,
      coordinates: `${coords.lat},${coords.lon}`,
      date: new Date().toISOString().split('T')[0],
    });
  }

  async getNumerology(birthDetails: BirthDetails & { name: string }) {
    return await this.makeApiCall('/numerology/life-path-number', {
      name: birthDetails.name,
      dob: birthDetails.dob,
    });
  }

  async getMangalDosha(birthDetails: BirthDetails) {
    const coords = this.parseCoordinates(birthDetails.place);
    const datetime = this.formatDateTime(birthDetails.dob, birthDetails.time);

    return await this.makeApiCall('/astrology/mangal-dosha', {
      datetime,
      coordinates: `${coords.lat},${coords.lon}`,
    });
  }

  async getSadeSati(birthDetails: BirthDetails) {
    const coords = this.parseCoordinates(birthDetails.place);
    const datetime = this.formatDateTime(birthDetails.dob, birthDetails.time);

    return await this.makeApiCall('/astrology/sade-sati', {
      datetime,
      coordinates: `${coords.lat},${coords.lon}`,
    });
  }

  async getPanchang(date: string, place: string) {
    const coords = this.parseCoordinates(place);

    return await this.makeApiCall('/astrology/panchang', {
      date,
      coordinates: `${coords.lat},${coords.lon}`,
    });
  }

  async getKaalSarpaDosha(birthDetails: BirthDetails) {
    const coords = this.parseCoordinates(birthDetails.place);
    const datetime = this.formatDateTime(birthDetails.dob, birthDetails.time);

    return await this.makeApiCall('/astrology/kaalsarpa-dosha', {
      datetime,
      coordinates: `${coords.lat},${coords.lon}`,
    });
  }

  async getMuhurat(startDate: string, endDate: string, place: string, eventType: string) {
    const coords = this.parseCoordinates(place);

    return await this.makeApiCall('/astrology/auspicious-timing', {
      start_date: startDate,
      end_date: endDate,
      coordinates: `${coords.lat},${coords.lon}`,
      event_type: eventType,
    });
  }
}

export const prokeralaAPI = new ProkeralaAPI();
export type { BirthDetails, PartnerDetails };