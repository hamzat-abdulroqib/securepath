import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Comment = {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
  };
};

export function useComments(reportId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reportId) {
      setComments([]);
      return;
    }

    let mounted = true;
    setLoading(true);

    const load = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(display_name)")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });

      if (!mounted) return;
      if (data) setComments(data as Comment[]);
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel(`comments-${reportId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments", filter: `report_id=eq.${reportId}` },
        async (payload) => {
          // Fetch the profile for the new comment
          const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", payload.new.user_id)
            .single();

          const newComment = {
            ...payload.new,
            profiles: data || { display_name: "Anonymous" },
          } as Comment;

          setComments((prev) => [...prev, newComment]);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [reportId]);

  return { comments, loading };
}
