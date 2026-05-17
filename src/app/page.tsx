import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const { data: todos } = supabase
    ? await supabase.from("todos").select()
    : { data: [] as Array<{ id: string; name: string }> };

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}
