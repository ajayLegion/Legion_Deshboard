import { supabase } from "@/integrations/supabase/client";

export interface Page {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  order: number;
}

class StorageService {
  async getAllPages(): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.mapFromDb);
  }

  async getPage(id: string): Promise<Page | undefined> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }

    return data ? this.mapFromDb(data) : undefined;
  }

  async savePage(page: Page): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dbPage = {
      id: page.id,
      user_id: user.id,
      title: page.title,
      content: page.content,
      parent_id: page.parentId,
      order_index: page.order,
    };

    const { error } = await supabase
      .from('pages')
      .upsert(dbPage);

    if (error) throw error;
  }

  async deletePage(id: string): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async searchPages(query: string): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.mapFromDb);
  }

  private mapFromDb(data: any): Page {
    return {
      id: data.id,
      title: data.title,
      content: data.content || '',
      parentId: data.parent_id,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      order: data.order_index,
    };
  }
}

export const storage = new StorageService();
