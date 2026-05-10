import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, getImageUrl } from '../config';

const { width } = Dimensions.get('window');

export default function AnimeDetailsScreen({ route, navigation }: any) {
  const { anime } = route.params;

  const renderEpisode = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.episodeCard}
      onPress={() => navigation.navigate('Player', { episode: item, anime: anime })}
    >
      <View style={styles.episodePlayIcon}>
        <Ionicons name="play" size={20} color="black" />
      </View>
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle}>Episodio {item.number}</Text>
        {item.title && <Text style={styles.episodeSubtitle} numberOfLines={1}>{item.title}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Absolute Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: getImageUrl(anime.bannerUrl || anime.imageUrl) }} 
            style={styles.headerImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 10, 10, 0.6)', COLORS.background]}
            style={styles.headerGradient}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{anime.title}</Text>
          
          <View style={styles.metaContainer}>
            <Text style={styles.metaMatch}>98% coincidencia</Text>
            <Text style={styles.metaYear}>2024</Text>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{anime.status || 'TV-14'}</Text>
            </View>
          </View>

          <Text style={styles.synopsis}>{anime.synopsis || anime.description || "No hay sinopsis disponible."}</Text>
          
          <Text style={styles.castText}>
            <Text style={{color: '#64748b'}}>Géneros: </Text>
            {anime.categories?.join(', ') || anime.genres?.join(', ')}
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-outline" size={24} color="white" />
              <Text style={styles.actionText}>Mi Lista</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="thumbs-up-outline" size={24} color="white" />
              <Text style={styles.actionText}>Calificar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color="white" />
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Episodios</Text>
          
          {(!anime.episodes || anime.episodes.length === 0) ? (
            <Text style={styles.noEpisodesText}>No hay episodios subidos aún.</Text>
          ) : (
            <FlatList
              data={[...anime.episodes].sort((a, b) => a.number - b.number)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderEpisode}
              scrollEnabled={false} // List inside ScrollView
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    width: width,
    height: 320,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  content: {
    padding: 20,
    marginTop: -40, // Overlap the gradient slightly
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  metaMatch: {
    color: '#4ade80', // Brighter green match
    fontWeight: 'bold',
    fontSize: 14,
  },
  metaYear: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  metaBadgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600'
  },
  synopsis: {
    color: COLORS.text,
    lineHeight: 24,
    fontSize: 15,
    marginBottom: 16,
  },
  castText: {
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    overflow: 'hidden',
    paddingRight: 12,
  },
  episodePlayIcon: {
    width: 140,
    height: 80,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  noEpisodesText: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  }
});
