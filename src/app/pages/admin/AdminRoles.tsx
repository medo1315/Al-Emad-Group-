import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { Shield, ShieldAlert, Check, Plus, Trash2, Edit2, Users, Save, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

interface Permission {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  permissions: string[]; // List of permission IDs
  userCount: number;
  isSystem: boolean; // Cannot be deleted
}

export function AdminRoles() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const t = {
    title: isRtl ? "إدارة الأدوار والصلاحيات" : "Roles & Permissions Management",
    subtitle: isRtl ? "إعداد صلاحيات المشرفين وتخصيص مستويات الوصول للوحة التحكم" : "Configure administrator privileges and control access to modules",
    addRole: isRtl ? "إضافة دور جديد" : "Add New Role",
    roleName: isRtl ? "اسم الدور" : "Role Name",
    description: isRtl ? "الوصف" : "Description",
    permissions: isRtl ? "الصلاحيات" : "Permissions",
    usersAssigned: isRtl ? "المستخدمين المرتبطين" : "Assigned Users",
    systemRole: isRtl ? "دور أساسي بالنظام" : "System Role",
    customRole: isRtl ? "دور مخصص" : "Custom Role",
    actions: isRtl ? "العمليات" : "Actions",
    saveChanges: isRtl ? "حفظ التغييرات" : "Save Changes",
    deleteConfirm: isRtl ? "هل أنت متأكد من رغبتك في حذف هذا الدور؟" : "Are you sure you want to delete this role?",
    roleCreated: isRtl ? "تم إنشاء الدور بنجاح" : "Role created successfully",
    roleUpdated: isRtl ? "تم تحديث صلاحيات الدور بنجاح" : "Role permissions updated successfully",
    roleDeleted: isRtl ? "تم حذف الدور بنجاح" : "Role deleted successfully",
    editRole: isRtl ? "تعديل صلاحيات الدور" : "Edit Role Permissions",
    modules: {
      dashboard: isRtl ? "لوحة القيادة" : "Dashboard",
      orders: isRtl ? "الطلبات" : "Orders",
      products: isRtl ? "المنتجات" : "Products",
      customers: isRtl ? "العملاء" : "Customers",
      analytics: isRtl ? "التحليلات" : "Analytics",
      inventory: isRtl ? "المخزون" : "Inventory",
      coupons: isRtl ? "الكوبونات" : "Coupons",
      settings: isRtl ? "الإعدادات" : "Settings"
    }
  };

  const initialPermissions: Permission[] = [
    { id: "view_dashboard", name: "View Dashboard Overview", nameAr: "عرض ملخص لوحة التحكم", description: "Access the main admin analytics dashboard widget cards.", descriptionAr: "الوصول لملخص وإحصائيات لوحة التحكم الرئيسية.", module: "dashboard" },
    { id: "manage_orders", name: "Manage Orders", nameAr: "إدارة الطلبات", description: "View, edit, and cancel customer orders.", descriptionAr: "عرض، تعديل، وإلغاء طلبات العملاء.", module: "orders" },
    { id: "manage_products", name: "Manage Products", nameAr: "إدارة المنتجات", description: "Create, edit, and delete store products.", descriptionAr: "إضافة وتعديل وحذف منتجات المتجر.", module: "products" },
    { id: "manage_customers", name: "Manage Customers", nameAr: "إدارة العملاء", description: "View customer list and delete customer accounts.", descriptionAr: "عرض تفاصيل وقائمة العملاء وحذف حساباتهم.", module: "customers" },
    { id: "view_analytics", name: "View Analytics", nameAr: "عرض التحليلات والتقارير", description: "Access complex charts, revenue figures, and store analytics.", descriptionAr: "الوصول لرسومات الإيرادات المفصلة والتقارير المالية.", module: "analytics" },
    { id: "manage_inventory", name: "Manage Inventory", nameAr: "إدارة المخزون", description: "Edit stock levels, adjust warehouse volumes, and update pricing.", descriptionAr: "تعديل كميات المخزون بالدكان وتحديث الأسعار والأحجام.", module: "inventory" },
    { id: "manage_coupons", name: "Manage Coupons", nameAr: "إدارة الكوبونات والخصومات", description: "Create and validate discount coupons for users.", descriptionAr: "إنشاء وتفعيل وإلغاء كوبونات الخصم للعملاء.", module: "coupons" },
    { id: "manage_roles", name: "Manage Roles & Accounts", nameAr: "إدارة الأدوار والحسابات", description: "Create sub-admin profiles and adjust active site permissions.", descriptionAr: "إنشاء حسابات المشرفين وتعديل صلاحياتهم وقوانين الوصول.", module: "settings" },
  ];

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "admin",
      name: "Administrator",
      nameAr: "مدير النظام العام",
      description: "Full access to all dashboard features, modules, settings, and administrator management.",
      descriptionAr: "الوصول الكامل لجميع ميزات لوحة التحكم، المنتجات، الإعدادات، وإدارة الحسابات.",
      permissions: ["view_dashboard", "manage_orders", "manage_products", "manage_customers", "view_analytics", "manage_inventory", "manage_coupons", "manage_roles"],
      userCount: 2,
      isSystem: true
    },
    {
      id: "manager",
      name: "Store Manager",
      nameAr: "مدير المتجر",
      description: "Can manage products, inventory, coupons, and orders. No access to settings or sub-admin roles.",
      descriptionAr: "يمكنه إدارة المنتجات، تعديل المخزون، الكوبونات، ومتابعة الطلبات. ليس لديه وصول للإعدادات والأدوار.",
      permissions: ["view_dashboard", "manage_orders", "manage_products", "manage_inventory", "manage_coupons"],
      userCount: 3,
      isSystem: false
    },
    {
      id: "support",
      name: "Customer Support",
      nameAr: "خدمة العملاء والطلبات",
      description: "Access to order statuses, customer lists, and dashboard updates. Cannot modify products or inventory.",
      descriptionAr: "إدارة وتتبع حالة الطلبات وقائمة العملاء، دون صلاحية تعديل المنتجات والمخزن.",
      permissions: ["view_dashboard", "manage_orders", "manage_customers"],
      userCount: 4,
      isSystem: false
    },
    {
      id: "analyst",
      name: "Financial Analyst",
      nameAr: "محلل مالي",
      description: "Dedicated access to financial charts and product performance metrics.",
      descriptionAr: "وصول مخصص للرسوم البيانية المالية، الأرباح، وتقارير أداء مبيعات المنتجات.",
      permissions: ["view_dashboard", "view_analytics"],
      userCount: 1,
      isSystem: false
    }
  ]);

  const [selectedRole, setSelectedRole] = useState<Role>(roles[0]);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getRoleNameAr = (name: string) => {
    switch (name) {
      case "Admin":
      case "Administrator": return "مدير النظام العام";
      case "Store Manager": return "مدير المتجر";
      case "Customer Support": return "خدمة العملاء والطلبات";
      case "Financial Analyst": return "محلل مالي";
      default: return name;
    }
  };

  const getRoleDescAr = (name: string, desc: string) => {
    switch (name) {
      case "Admin":
      case "Administrator": return "الوصول الكامل لجميع ميزات لوحة التحكم، المنتجات، الإعدادات، وإدارة الحسابات.";
      case "Store Manager": return "يمكنه إدارة المنتجات، تعديل المخزون، الكوبونات، ومتابعة الطلبات. ليس لديه وصول للإعدادات والأدوار.";
      case "Customer Support": return "إدارة وتتبع حالة الطلبات وقائمة العملاء، دون صلاحية تعديل المنتجات والمخزن.";
      case "Financial Analyst": return "وصول مخصص للرسوم البيانية المالية، الأرباح، وتقارير أداء مبيعات المنتجات.";
      default: return desc;
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Account/roles`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const formatted: Role[] = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          nameAr: getRoleNameAr(r.name),
          description: r.description,
          descriptionAr: getRoleDescAr(r.name, r.description),
          permissions: r.permissions,
          userCount: r.userCount,
          isSystem: r.isSystem
        }));
        setRoles(formatted);
        // Sync selected role
        const match = formatted.find(r => r.id === selectedRole.id);
        if (match) {
          setSelectedRole(match);
        } else if (formatted.length > 0) {
          setSelectedRole(formatted[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch roles from server, using fallback data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [user]);

  const handleTogglePermission = (permissionId: string) => {
    if (selectedRole.isSystem && (selectedRole.name === "Admin" || selectedRole.name === "Administrator")) {
      toast.warning(isRtl ? "لا يمكن تعديل صلاحيات مدير النظام العام" : "Cannot modify Administrator system role.");
      return;
    }
    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Account/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ permissions: selectedRole.permissions })
      });

      if (!response.ok) throw new Error("Failed to save role permissions.");

      toast.success(t.roleUpdated);
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.success(t.roleUpdated + " (Locally)");
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/Account/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ roleName: newRoleName, description: newRoleDesc })
      });

      if (!response.ok) throw new Error("Failed to create role.");

      toast.success(t.roleCreated);
      fetchRoles();
    } catch (err) {
      console.error(err);
      // Fallback
      const newRole: Role = {
        id: newRoleName.toLowerCase().replace(/\s+/g, "-"),
        name: newRoleName,
        nameAr: newRoleName,
        description: newRoleDesc || "Custom dashboard role",
        descriptionAr: newRoleDesc || "دور مخصص للوحة التحكم",
        permissions: ["view_dashboard"],
        userCount: 0,
        isSystem: false
      };
      setRoles(prev => [...prev, newRole]);
      setSelectedRole(newRole);
      toast.success(t.roleCreated + " (Locally)");
    }

    setNewRoleName("");
    setNewRoleDesc("");
    setIsAdding(false);
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;

    setRoles(prev => prev.filter(r => r.id !== id));
    if (selectedRole.id === id) {
      setSelectedRole(roles[0]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Account/roles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete role.");
      toast.success(t.roleDeleted);
      fetchRoles();
    } catch (err) {
      console.error(err);
      toast.success(t.roleDeleted + " (Locally)");
    }
  };

  return (
    <div className={`p-6 sm:p-8 min-h-screen text-white ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Title */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-teal-accent animate-pulse" />
            <span>{t.title}</span>
          </h1>
          <p className="text-sage-green-light">{t.subtitle}</p>
        </div>

        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" />
          <span>{t.addRole}</span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-display text-xl text-teal-accent border-b border-teal-accent/20 pb-2">
            {isRtl ? "الأدوار الحالية" : "Active Roles"}
          </h2>
          <div className="space-y-3">
            {roles.map((role) => {
              const isActive = selectedRole.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-teal-accent/15 border-teal-accent/70 shadow-lg scale-[1.02]"
                      : "bg-petroleum-blue/20 border-teal-accent/10 hover:border-teal-accent/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-lg text-white">
                      {isRtl ? role.nameAr : role.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      role.isSystem
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-teal-accent/20 text-teal-accent border border-teal-accent/30"
                    }`}>
                      {role.isSystem ? t.systemRole : t.customRole}
                    </span>
                  </div>
                  <p className="text-xs text-sage-green-light line-clamp-2 mb-4">
                    {isRtl ? role.descriptionAr : role.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-accent" />
                      {role.userCount} {isRtl ? "مستخدمين" : "users"}
                    </span>
                    {!role.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2 bg-petroleum-blue/15 border border-teal-accent/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-accent/20 pb-4">
            <div>
              <span className="text-xs text-teal-accent uppercase font-bold tracking-wider">{t.editRole}</span>
              <h2 className="font-display text-2xl font-bold mt-1 text-white">
                {isRtl ? selectedRole.nameAr : selectedRole.name}
              </h2>
            </div>
            {selectedRole.id === "admin" && (
              <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <Lock className="w-4 h-4" />
                <span>{isRtl ? "دور محمي بالكامل" : "Protected Role"}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-sage-green-light italic leading-relaxed">
            {isRtl ? selectedRole.descriptionAr : selectedRole.description}
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-teal-accent border-b border-teal-accent/10 pb-2">
              {isRtl ? "قائمة الصلاحيات المتاحة" : "Permissions Checklist"}
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {initialPermissions.map((permission) => {
                const hasPermission = selectedRole.permissions.includes(permission.id);
                return (
                  <div
                    key={permission.id}
                    onClick={() => handleTogglePermission(permission.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                      hasPermission
                        ? "bg-teal-accent/5 border-teal-accent/40"
                        : "bg-transparent border-teal-accent/10 hover:border-teal-accent/25"
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                      hasPermission
                        ? "bg-teal-accent border-teal-accent text-white"
                        : "border-teal-accent/30"
                    }`}>
                      {hasPermission && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{isRtl ? permission.nameAr : permission.name}</p>
                      <p className="text-xs text-sage-green-light mt-1 leading-relaxed">
                        {isRtl ? permission.descriptionAr : permission.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedRole.id !== "admin" && (
            <div className="pt-4 border-t border-teal-accent/15 flex justify-end">
              <Button onClick={handleSaveChanges} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Role Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`bg-petroleum-dark border border-teal-accent/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative ${isRtl ? "text-right" : "text-left"}`}>
            <h2 className="font-display text-2xl font-bold text-white mb-6">
              {t.addRole}
            </h2>
            <form onSubmit={handleCreateRole} className="space-y-5">
              <div>
                <label className="block text-sm text-sage-green-light mb-2">{t.roleName}</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder={isRtl ? "مثال: مشرف المحتوى" : "e.g. Content Editor"}
                  className="w-full px-4 py-3 bg-petroleum-blue/30 text-white border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm text-sage-green-light mb-2">{t.description}</label>
                <textarea
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder={isRtl ? "توضيح الصلاحيات العامة للدور..." : "Specify duties and limits of this role..."}
                  className="w-full h-24 px-4 py-3 bg-petroleum-blue/30 text-white border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>
                  {isRtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" className="flex-1">
                  {isRtl ? "إنشاء" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
