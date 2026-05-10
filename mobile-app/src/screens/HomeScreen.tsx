import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL, COLORS, getImageUrl } from '../config';

const { width } = Dimensions.get('window');

interface Anime {
  id: string;
  title: string;
  imageUrl: string;
  status: string;
  description?: string;
  genres?: string[];
}

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/anime`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAnimes(data);
      }
    } catch (error) {
      console.error('Error fetching animes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Anime }) => (
    <TouchableOpacity 
      style={styles.card}
      onClick={() => {}} // React Native Web compat
      onPress={() => navigation.navigate('AnimeDetails', { anime: item })}
    >
      <Image source={{ uri: getImageUrl(item.imageUrl) }} style={styles.cardImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Hero anime can be the latest "En emisión" or just the first one
  const heroAnime = animes.find(a => a.status === 'En emisión') || animes[0];
  const airingAnimes = animes.filter(a => a.status === 'En emisión');
  const otherAnimes = animes.filter(a => a.status !== 'En emisión');

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      {heroAnime && (
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: getImageUrl(heroAnime.imageUrl) }} 
            style={styles.heroImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 10, 10, 0.4)', COLORS.background]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{heroAnime.title}</Text>
            <Text style={styles.heroTags}>
              {heroAnime.genres?.join(' • ') || 'Anime • ' + heroAnime.status}
            </Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => navigation.navigate('AnimeDetails', { anime: heroAnime })}
              >
                <Ionicons name="play" size={20} color="black" />
                <Text style={styles.playButtonText}>Reproducir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.listButton}>
                <Ionicons name="add" size={24} color={COLORS.text} />
                <Text style={styles.listButtonText}>Mi Lista</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Horizontal Lists */}
      {airingAnimes.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>En Emisión</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={airingAnimes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      )}

      {otherAnimes.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Catálogo</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={otherAnimes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    width: width,
    height: 500,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  heroTags: {
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 20,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    gap: 6,
  },
  playButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  listButtonText: {
    color: COLORS.text,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600'
  },
  listContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 14,
  },
  card: {
    width: 130,
    height: 190,
    marginRight: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
