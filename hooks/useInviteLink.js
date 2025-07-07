import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./useAuth";

export const useInviteLink = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Check if there's an invite code in the URL
    if (params.inviteCode && user) {
      // For now, just navigate to the invite screen
      router.push(`/invite/${params.inviteCode}`);
    }
  }, [user, params.inviteCode, router]);
};
