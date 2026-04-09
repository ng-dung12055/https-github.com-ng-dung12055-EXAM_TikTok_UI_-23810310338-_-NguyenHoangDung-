import React, { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, Feather, FontAwesome } from '@expo/vector-icons';

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export default function VideoPost({
  source,
  username,
  date,
  caption,
  song,
  avatar,
  initialLikes,
  commentCount,
  canFollow = false,
  onCommentPress,
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [followed, setFollowed] = useState(false);

  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const toggleLike = () => {
    setLiked((prev) => {
      setLikes((count) => count + (prev ? -1 : 1));
      return !prev;
    });
  };

  const toggleFollow = () => setFollowed((value) => !value);

  return (
    <ImageBackground source={source} style={styles.bg} resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,0,0,0.18)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.86)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      <View style={styles.rightCol}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {canFollow && !followed && (
            <TouchableOpacity
              onPress={toggleFollow}
              style={styles.plusBadge}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AntDesign name="plus" size={14} color="#fff" />
            </TouchableOpacity>
          )}
          {canFollow && followed && (
            <TouchableOpacity
              onPress={toggleFollow}
              style={[styles.plusBadge, styles.followedBadge]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="check" size={13} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.action}
          onPress={toggleLike}
          activeOpacity={0.7}
        >
          <FontAwesome
            name="heart"
            size={38}
            color={liked ? '#FF3B5C' : '#fff'}
            style={styles.iconShadow}
          />
          <Text style={styles.actionText}>{formatCount(likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={onCommentPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={37}
            color="#fff"
            style={styles.iconShadow}
          />
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} activeOpacity={0.7}>
          <Ionicons
            name="arrow-redo-sharp"
            size={42}
            color="#fff"
            style={styles.iconShadow}
          />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <View style={styles.musicCluster}>
          <Ionicons
            name="musical-note"
            size={18}
            color="rgba(255,255,255,0.55)"
            style={styles.musicFloating}
          />
          <Animated.View
            style={[styles.disc, { transform: [{ rotate: spinDeg }] }]}
          >
            <Image source={{ uri: avatar }} style={styles.discImg} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.username}>
          @{username}
          {date ? <Text style={styles.date}>{' \u00b7 '}{date}</Text> : null}
        </Text>
        <Text style={styles.caption} numberOfLines={3}>
          {caption}
        </Text>
        <View style={styles.songRow}>
          <Ionicons name="musical-note" size={14} color="#fff" />
          <Text style={styles.songText} numberOfLines={1}>
            {' '}
            {song}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
  },
  rightCol: {
    position: 'absolute',
    right: 10,
    bottom: 24,
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.8,
    borderColor: '#fff',
    backgroundColor: '#333',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: '#FF3B5C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followedBadge: {
    backgroundColor: '#25C366',
  },
  action: {
    alignItems: 'center',
    width: 56,
    marginBottom: 15,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 2 },
  },
  musicCluster: {
    width: 58,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  musicFloating: {
    position: 'absolute',
    left: 2,
    bottom: 14,
  },
  disc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17,17,17,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: 'rgba(17,17,17,0.92)',
  },
  discImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bottomInfo: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingRight: 92,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  date: {
    fontWeight: '500',
    fontSize: 15,
  },
  caption: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 9,
    lineHeight: 21,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songText: {
    color: '#fff',
    fontSize: 13,
    flexShrink: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
});
