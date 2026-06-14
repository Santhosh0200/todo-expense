import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";

const SUPABASE_URL = "https://trsgedzccdfchfulbifq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyc2dlZHpjY2RmY2hmdWxiaWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjMyMDIsImV4cCI6MjA5Njk5OTIwMn0.IuwxKmLpt7Qen-i-z9_8g5rteQig5OA2N85g9rPrIoU";

const CATEGORIES = ["Food", "Transport", "Shopping", "Education", "Health", "Entertainment", "Other"];
const CAT_COLORS = { Food:"#1D9E75",Transport:"#378ADD",Shopping:"#D4537E",Education:"#7F77DD",Health:"#E24B4A",Entertainment:"#BA7517",Other:"#888780" };
const CAT_BG = { Food:"#e1f5ee",Transport:"#e6f1fb",Shopping:"#fbeaf0",Education:"#eeedfe",Health:"#fcebeb",Entertainment:"#faeeda",Other:"#f1efe8" };
const CAT_ICONS = { Food:"bowl",Transport:"bus",Shopping:"shopping-bag",Education:"book",Health:"heart",Entertainment:"device-gamepad",Other:"dots" };

interface Todo {
  id: string | number;
  text: string;
  done: boolean;
  due?: string;
  created_at: string;
}

interface Expense {
  id: string | number;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface Toast {
  msg: string;
  type: "info" | "success" | "error" | "warning";
}

interface ProxyResponse {
  status: number;
  data: any;
}

async function sbProxy(method: string, table: string, body: any, query: string = ""): Promise<ProxyResponse> {
  const systemPrompt = `You are a Supabase REST API proxy. Make a ${method} request to ${SUPABASE_URL}/rest/v1/${table}${query} with headers: apikey: ${SUPABASE_KEY}, Authorization: Bearer ${SUPABASE_KEY}, Content-Type: application/json, Prefer: return=representation. ${body ? `Body: ${JSON.stringify(body)}` : ""} Return ONLY a JSON object with exactly two fields: "status" (number) and "data" (the parsed response body, or null if empty). No explanation, no markdown.`;
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: "Execute the request now." }]
    })
  });
  const result = await resp.json();
  const text = result.content?.[0]?.text || "{}";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch { return { status: 500, data: null }; }
}

function isOverdue(due: string | undefined): boolean { if (!due) return false; return new Date(due) < new Date(new Date().toDateString()); }
function isDueToday(due: string | undefined): boolean { if (!due) return false; return new Date(due).toDateString() === new Date().toDateString(); }

export default function App() {
  const [tab, setTab] = useState<"todo" | "expense">("todo");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const [taskText, setTaskText] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "active" | "done" | "today" | "overdue">("all");

  const [expName, setExpName] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expCat, setExpCat] = useState("Food");
  const [expFilter, setExpFilter] = useState("All");

  const [budget, setBudget] = useState(localStorage.getItem("planner_budget") || "");
  const [budgetEdit, setBudgetEdit] = useState("");
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  const showToast = (msg: string, type: "info" | "success" | "error" | "warning" = "info") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, er] = await Promise.all([
        sbProxy("GET","todos","","?select=*&order=created_at.desc"),
        sbProxy("GET","expenses","","?select=*&order=date.desc")
      ]);
      const t = Array.isArray(tr.data) ? tr.data : [];
      const e = Array.isArray(er.data) ? er.data : [];
      setTodos(t); setExpenses(e);
      const overdue = t.filter(x=>!x.done&&isOverdue(x.due));
      const today = t.filter(x=>!x.done&&isDueToday(x.due));
      if (overdue.length) showToast(`⚠️ ${overdue.length} overdue task(s)!`, "error");
      else if (today.length) showToast(`📅 ${today.length} task(s) due today`, "warning");
    } catch { showToast("Could not load data","error"); }
    setLoading(false);
  }, []);

  useEffect(()=>{ loadData(); },[loadData]);

  const addTodo = async () => {
    if (!taskText.trim()) return;
    showToast("Saving...","info");
    try {
      const r = await sbProxy("POST","todos",{text:taskText.trim(),done:false,due:taskDue||null});
      const row = Array.isArray(r.data) ? r.data[0] : r.data;
      if (row?.id) {
        setTodos(prev=>[row,...prev]);
        setTaskText(""); setTaskDue("");
        showToast("Task added ✓","success");
      } else { showToast("Failed to add task","error"); }
    } catch { showToast("Failed to add task","error"); }
  };

  const toggleTodo = async (id: string | number, done: boolean) => {
    try {
      await sbProxy("PATCH","todos",{done:!done},`?id=eq.${id}`);
      setTodos(prev=>prev.map(t=>t.id===id?{...t,done:!done}:t));
      if (!done) showToast("Task completed! 🎉","success");
    } catch { showToast("Failed to update","error"); }
  };

  const deleteTodo = async (id: string | number) => {
    try {
      await sbProxy("DELETE","todos",null,`?id=eq.${id}`);
      setTodos(prev=>prev.filter(t=>t.id!==id));
      showToast("Deleted","info");
    } catch { showToast("Failed to delete","error"); }
  };

  const addExpense = async () => {
    const amt = parseFloat(expAmt);
    if (!expName.trim()||isNaN(amt)||amt<=0) {
      showToast("Enter a valid name and amount","warning");
      return;
    }
    showToast("Saving...","info");
    try {
      const r = await sbProxy("POST","expenses",{name:expName.trim(),amount:amt,category:expCat,date:new Date().toISOString()});
      let row = r.data;
      if (Array.isArray(row)) row = row[0];
      if (row?.id) {
        setExpenses(prev=>[row,...prev]);
        setExpName(""); setExpAmt("");
        showToast("Expense logged ✓","success");
      } else {
        const fallback = {id:Date.now().toString(),name:expName.trim(),amount:amt,category:expCat,date:new Date().toISOString()};
        setExpenses(prev=>[fallback,...prev]);
        setExpName(""); setExpAmt("");
        showToast("Expense logged ✓","success");
        loadData();
      }
    } catch { showToast("Failed to log expense","error"); }
  };

  const deleteExpense = async (id: string | number) => {
    try {
      await sbProxy("DELETE","expenses",null,`?id=eq.${id}`);
      setExpenses(prev=>prev.filter(e=>e.id!==id));
      showToast("Deleted","info");
    } catch { showToast("Failed to delete","error"); }
  };

  const saveBudget = () => {
    const v = parseFloat(budgetEdit);
    if (!isNaN(v)&&v>0) { setBudget(v.toString()); localStorage.setItem("planner_budget",v.toString()); setShowBudgetInput(false); showToast("Budget saved ✓","success"); }
  };

  const filteredTodos = todos.filter(t=>{
    if (taskFilter==="active") return !t.done;
    if (taskFilter==="done") return t.done;
    if (taskFilter==="overdue") return !t.done&&isOverdue(t.due);
    if (taskFilter==="today") return !t.done&&isDueToday(t.due);
    return true;
  });

  const filteredExpenses = expFilter==="All" ? expenses : expenses.filter(e=>e.category===expFilter);
  const total = expenses.reduce((s,e)=>s+e.amount,0);
  const budgetNum = parseFloat(budget);
  const remaining = !isNaN(budgetNum)&&budgetNum>0 ? budgetNum-total : null;
  const pct = remaining!==null ? Math.min(100,(total/budgetNum)*100) : 0;
  const barColor = pct>90?"#E24B4A":pct>70?"#BA7517":"#1D9E75";
  const catTotals = CATEGORIES.map(c=>({c,v:expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)})).filter(x=>x.v>0);
  const overdueCount = todos.filter(t=>!t.done&&isOverdue(t.due)).length;
  const todayCount = todos.filter(t=>!t.done&&isDueToday(t.due)).length;
  const activeCount = todos.filter(t=>!t.done).length;

  const s = {
    card:{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"12px 16px"} as CSSProperties,
    input:{width:"100%",padding:"10px 12px",fontSize:14,borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",boxSizing:"border-box"} as CSSProperties,
    pill:(active: boolean, color: string)=>({padding:"5px 14px",borderRadius:99,fontSize:12,fontWeight:active?500:400,border:active?`1.5px solid ${color}`:"0.5px solid var(--color-border-tertiary)",background:active?color+"18":"transparent",color:active?color:"var(--color-text-secondary)",cursor:"pointer"} as CSSProperties),
    iconBtn:{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:17,padding:"2px 4px",display:"flex",alignItems:"center"} as CSSProperties,
  };

  return (
    <div style={{fontFamily:"var(--font-sans)",maxWidth:660,margin:"0 auto",padding:"1.25rem 1rem"} as CSSProperties}>

      {toast&&(
        <div style={{position:"fixed",top:18,right:18,zIndex:999,background:toast.type==="error"?"#E24B4A":toast.type==="success"?"#1D9E75":toast.type==="warning"?"#BA7517":"#378ADD",color:"#fff",padding:"10px 18px",borderRadius:"var(--border-radius-md)",fontSize:13,fontWeight:500,maxWidth:280}}>
          {toast.msg}
        </div>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem"} as CSSProperties}>
        <div>
          <h1 style={{fontSize:22,fontWeight:500,margin:0,color:"var(--color-text-primary)"}}>My Planner</h1>
          <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:"2px 0 0"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
        </div>
        <button onClick={loadData} style={{...s.iconBtn,border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"6px 10px"}} title="Refresh">
          <i className="ti ti-refresh" style={{fontSize:16}} aria-hidden="true"/>
        </button>
      </div>

      {overdueCount>0&&(
        <div style={{background:"#fcebeb",border:"0.5px solid #f09595",borderRadius:"var(--border-radius-md)",padding:"10px 14px",marginBottom:"1rem",display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-alert-triangle" style={{fontSize:16,color:"#E24B4A"}} aria-hidden="true"/>
          <span style={{fontSize:13,color:"#A32D2D",fontWeight:500}}>⚠️ {overdueCount} task{overdueCount>1?"s":""} overdue!</span>
        </div>
      )}
      {todayCount>0&&overdueCount===0&&(
        <div style={{background:"#faeeda",border:"0.5px solid #FAC775",borderRadius:"var(--border-radius-md)",padding:"10px 14px",marginBottom:"1rem",display:"flex",alignItems:"center",gap:8}}>
          <i className="ti ti-clock" style={{fontSize:16,color:"#BA7517"}} aria-hidden="true"/>
          <span style={{fontSize:13,color:"#854F0B",fontWeight:500}}>📅 {todayCount} task{todayCount>1?"s":""} due today</span>
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:"1.5rem",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:4} as CSSProperties}>
        {[["todo","checklist","Tasks"],["expense","wallet","Expenses"]].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as "todo" | "expense")} style={{flex:1,padding:"9px 0",borderRadius:"var(--border-radius-md)",border:"none",background:tab===id?"var(--color-background-primary)":"transparent",color:tab===id?"var(--color-text-primary)":"var(--color-text-secondary)",fontWeight:tab===id?500:400,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7} as CSSProperties}>
            <i className={`ti ti-${icon}`} aria-hidden="true" style={{fontSize:16}}/> {label}
          </button>
        ))}
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-tertiary)",fontSize:14}}>
          <i className="ti ti-loader" style={{fontSize:24,display:"block",marginBottom:8}} aria-hidden="true"/> Connecting to database...
        </div>
      ):tab==="todo"?(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:"1.25rem"} as CSSProperties}>
            {[["all","All",todos.length,"#378ADD"],["active","Pending",activeCount,"#BA7517"],["today","Today",todayCount,"#1D9E75"],["overdue","Overdue",overdueCount,"#E24B4A"]].map(([f,l,v,c])=>(
              <div key={f as string} onClick={()=>setTaskFilter(f as "all" | "active" | "done" | "today" | "overdue")} style={{...s.card,textAlign:"center",cursor:"pointer",borderColor:taskFilter===f?c:undefined} as CSSProperties}>
                <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:3}}>
                  {l}
                </div>
                <div style={{fontSize:20,fontWeight:500,color:c as string}}>
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div style={{...s.card,marginBottom:"1rem"} as CSSProperties}>
            <input value={taskText} onChange={e=>setTaskText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()} placeholder="What needs to be done?" style={{...s.input,marginBottom:8} as CSSProperties}/>
            <div style={{display:"flex",gap:8,alignItems:"center"} as CSSProperties}>
              <label style={{fontSize:12,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>Due date</label>
              <input type="date" value={taskDue} onChange={e=>setTaskDue(e.target.value)} style={{...s.input,flex:1} as CSSProperties}/>
              <button onClick={addTodo} style={{padding:"10px 20px",borderRadius:"var(--border-radius-md)",border:"none",background:"#378ADD",color:"#fff",fontWeight:500,fontSize:14,cursor:"pointer",whiteSpace:"nowrap"}}>
                Add task
              </button>
            </div>
          </div>

          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"} as CSSProperties}>
            {[["all","All","#378ADD"],["active","Pending","#BA7517"],["today","Due today","#1D9E75"],["overdue","Overdue","#E24B4A"],["done","Completed","#888780"]].map(([f,label,c])=>(
              <button key={f as string} onClick={()=>setTaskFilter(f as "all" | "active" | "done" | "today" | "overdue")} style={s.pill(taskFilter===f, c as string)}>{label}</button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8} as CSSProperties}>
            {filteredTodos.length===0&&(
              <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-tertiary)",fontSize:14}}>
                <i className="ti ti-mood-smile" style={{fontSize:28,display:"block",marginBottom:8}} aria-hidden="true"/>
                No tasks here
              </div>
            )}
            {filteredTodos.map(t=>{
              const overdue=!t.done&&isOverdue(t.due);
              const today=!t.done&&isDueToday(t.due);
              return(
                <div key={t.id} style={{...s.card,display:"flex",alignItems:"flex-start",gap:12,borderLeft:overdue?"3px solid #E24B4A":today?"3px solid #BA7517":t.done?"3px solid #1D9E75":"3px solid transparent"}}>
                  <button onClick={()=>toggleTodo(t.id,t.done)} style={{width:22,height:22,borderRadius:6,border:t.done?"none":"1.5px solid var(--color-border-secondary)",background:t.done?"#1D9E75":"transparent",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                    {t.done&&<i className="ti ti-check" aria-hidden="true" style={{fontSize:13}}/>}
                  </button>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:t.done?"var(--color-text-tertiary)":"var(--color-text-primary)",textDecoration:t.done?"line-through":"none",fontWeight:t.done?400:500}}>{t.text}</div>
                    {t.due&&(
                      <div style={{fontSize:11,marginTop:4,color:overdue?"#A32D2D":today?"#854F0B":"var(--color-text-tertiary)",fontWeight:overdue||today?500:400}}>
                        <i className={`ti ti-${overdue?"alert-circle":"calendar"}`} aria-hidden="true" style={{fontSize:11,marginRight:3}}/>
                        {overdue?"Overdue · ":today?"Due today · ":""}{new Date(t.due).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </div>
                    )}
                    <div style={{fontSize:10,color:"var(--color-text-tertiary)",marginTop:2}}>Added {new Date(t.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                  </div>
                  {t.done&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:"#e1f5ee",color:"#0F6E56",fontWeight:500,flexShrink:0}}>Done</span>}
                  {overdue&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:"#fcebeb",color:"#A32D2D",fontWeight:500,flexShrink:0}}>Overdue</span>}
                  {today&&!overdue&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:"#faeeda",color:"#854F0B",fontWeight:500,flexShrink:0}}>Today</span>}
                  <button onClick={()=>deleteTodo(t.id)} style={s.iconBtn} title="Delete"><i className="ti ti-trash" aria-hidden="true"/></button>
                </div>
              );
            })}
          </div>
        </div>
      ):(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:"1.25rem"} as CSSProperties}>
            <div style={s.card}>
              <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:3}}>Total spent</div>
              <div style={{fontSize:20,fontWeight:500,color:"#E24B4A"}}>₹{total.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
            </div>
            <div style={s.card}>
              <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:3}}>Budget</div>
              {showBudgetInput?(
                <div style={{display:"flex",gap:4} as CSSProperties}>
                  <input value={budgetEdit} onChange={e=>setBudgetEdit(e.target.value)} placeholder="e.g. 5000" style={{...s.input,padding:"4px 8px",fontSize:13} as CSSProperties}/>
                  <button onClick={saveBudget} style={{padding:"4px 10px",background:"#378ADD",color:"#fff",border:"none",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:12}}>Save</button>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:6} as CSSProperties}>
                  <span style={{fontSize:20,fontWeight:500,color:"var(--color-text-primary)"}}>{budget?`₹${parseFloat(budget).toLocaleString("en-IN")}`:"—"}</span>
                  <button onClick={()=>{setBudgetEdit(budget);setShowBudgetInput(true);}} style={s.iconBtn}><i className="ti ti-edit" aria-hidden="true" style={{fontSize:14}}/></button>
                </div>
              )}
            </div>
            <div style={s.card}>
              <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:3}}>Remaining</div>
              <div style={{fontSize:20,fontWeight:500,color:remaining===null?"var(--color-text-tertiary)":remaining<0?"#E24B4A":"#1D9E75"}}>
                {remaining===null?"—":`₹${Math.abs(remaining).toLocaleString("en-IN",{maximumFractionDigits:0})}${remaining<0?" over":""}`}
              </div>
            </div>
          </div>

          {remaining!==null&&(
            <div style={{marginBottom:"1rem"} as CSSProperties}>
              <div style={{height:8,borderRadius:99,background:"var(--color-background-secondary)",overflow:"hidden"} as CSSProperties}>
                <div style={{height:"100%",width:`${pct.toFixed(1)}%`,background:barColor,borderRadius:99} as CSSProperties}/>
              </div>
              <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:3}}>{pct.toFixed(0)}% of ₹{parseFloat(budget).toLocaleString("en-IN")} used</div>
            </div>
          )}

          {catTotals.length>0&&(
            <div style={{...s.card,marginBottom:"1rem"} as CSSProperties}>
              <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:10,fontWeight:500}}>Spending by category</div>
              <div style={{display:"flex",flexDirection:"column",gap:8} as CSSProperties}>
                {catTotals.sort((a,b)=>b.v-a.v).map(({c,v})=>(
                  <div key={c} style={{display:"flex",alignItems:"center",gap:10} as CSSProperties}>
                    <span style={{fontSize:12,width:90,color:"var(--color-text-secondary)",flexShrink:0}}>{c}</span>
                    <div style={{flex:1,height:6,borderRadius:99,background:"var(--color-background-secondary)",overflow:"hidden"} as CSSProperties}>
                      <div style={{height:"100%",width:`${((v/total)*100).toFixed(1)}%`,background:CAT_COLORS[c as keyof typeof CAT_COLORS],borderRadius:99} as CSSProperties}/>
                    </div>
                    <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)",minWidth:70,textAlign:"right"}}>₹{v.toLocaleString("en-IN",{maximumFractionDigits:0})}</span>
                    <span style={{fontSize:11,color:"var(--color-text-tertiary)",minWidth:32,textAlign:"right"}}>{((v/total)*100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{...s.card,marginBottom:"1rem"} as CSSProperties}>
            <div style={{display:"flex",gap:8,marginBottom:8} as CSSProperties}>
              <input value={expName} onChange={e=>setExpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addExpense()} placeholder="Expense name" style={{...s.input,flex:2} as CSSProperties}/>
              <input value={expAmt} onChange={e=>setExpAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addExpense()} placeholder="₹ Amount" type="number" style={{...s.input,flex:1} as CSSProperties}/>
            </div>
            <div style={{display:"flex",gap:8} as CSSProperties}>
              <select value={expCat} onChange={e=>setExpCat(e.target.value)} style={{...s.input,flex:1} as CSSProperties}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
              <button onClick={addExpense} style={{padding:"10px 20px",borderRadius:"var(--border-radius-md)",border:"none",background:"#1D9E75",color:"#fff",fontWeight:500,fontSize:14,cursor:"pointer"}}>
                Log expense
              </button>
            </div>
          </div>

          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"} as CSSProperties}>
            {["All",...CATEGORIES].map(f=>(
              <button key={f} onClick={()=>setExpFilter(f)} style={s.pill(expFilter===f,CAT_COLORS[f as keyof typeof CAT_COLORS]||"#378ADD")}>{f}</button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:8} as CSSProperties}>
            {filteredExpenses.length===0&&(
              <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-tertiary)",fontSize:14}}>
                <i className="ti ti-receipt" style={{fontSize:28,display:"block",marginBottom:8}} aria-hidden="true"/>
                No expenses here
              </div>
            )}
            {filteredExpenses.map(e=>(
              <div key={e.id} style={{...s.card,display:"flex",alignItems:"center",gap:12} as CSSProperties}>
                <div style={{width:36,height:36,borderRadius:"var(--border-radius-md)",background:CAT_BG[e.category as keyof typeof CAT_BG],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0} as CSSProperties}>
                  <i className={`ti ti-${CAT_ICONS[e.category as keyof typeof CAT_ICONS]}`} aria-hidden="true" style={{fontSize:18,color:CAT_COLORS[e.category as keyof typeof CAT_COLORS]}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{e.name}</div>
                  <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>
                    <span style={{display:"inline-block",padding:"1px 7px",borderRadius:99,background:CAT_BG[e.category as keyof typeof CAT_BG],color:CAT_COLORS[e.category as keyof typeof CAT_COLORS],fontSize:11,marginRight:6}}>{e.category}</span>
                    {new Date(e.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </div>
                </div>
                <div style={{fontWeight:500,fontSize:15,color:"var(--color-text-primary)"}}>₹{e.amount.toLocaleString("en-IN",{maximumFractionDigits:2})}</div>
                <button onClick={()=>deleteExpense(e.id)} style={s.iconBtn} title="Delete"><i className="ti ti-trash" aria-hidden="true"/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
