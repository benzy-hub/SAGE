"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAdminColleges,
  useAdminDepartments,
  useAdminStudents,
  useCreateStudent,
  useDeleteStudent,
  useBulkCreateStudents,
  useUpdateStudent,
} from "@/hooks/use-admin";
import type {
  AdminBulkStudentRow,
  AdminBulkStudentResult,
} from "@/lib/admin/types";

interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  studentId: string;
  college: string;
  department: string;
  program: string;
  level: string;
  year: number;
  createdAt: string;
}

function fallbackLevels(departmentName: string) {
  if (
    departmentName.includes("Medicine") ||
    departmentName.includes("MBBS") ||
    departmentName.includes("Law") ||
    departmentName.includes("Architecture")
  ) {
    return ["100", "200", "300", "400", "500", "600"];
  }
  if (
    (departmentName.includes("Engineering") &&
      !departmentName.includes("Software Engineering")) ||
    departmentName.includes("Pharmacy")
  ) {
    return ["100", "200", "300", "400", "500"];
  }
  return ["100", "200", "300", "400"];
}

export default function AdminStudentsPage() {
  const { data, isLoading, error } = useAdminStudents();
  const { data: collegesData } = useAdminColleges();
  const { data: departmentsData } = useAdminDepartments();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [deleteStudentRow, setDeleteStudentRow] = useState<StudentRow | null>(
    null,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [newCollege, setNewCollege] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newProgram, setNewProgram] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newYear, setNewYear] = useState("1");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  const bulkCreateStudents = useBulkCreateStudents();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkPreview, setBulkPreview] = useState<AdminBulkStudentRow[]>([]);
  const [bulkResults, setBulkResults] = useState<
    AdminBulkStudentResult[] | null
  >(null);
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);

  const parseBulkCsv = (raw: string) => {
    setBulkParseError(null);
    setBulkPreview([]);
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setBulkParseError(
        "Paste a CSV with a header row and at least one data row.",
      );
      return;
    }
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const rows: AdminBulkStudentRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((c) => c.trim());
      if (cells.every((c) => c === "")) continue;
      const row: Record<string, string> = {};
      header.forEach((key, idx) => {
        row[key] = cells[idx] ?? "";
      });
      rows.push({
        firstName: row.firstname ?? row.first_name ?? "",
        lastName: row.lastname ?? row.last_name ?? "",
        email: row.email ?? "",
        password: row.password ?? "",
        studentId: row.studentid ?? row.student_id ?? row.matric ?? "",
        college: row.college ?? "",
        department: row.department ?? "",
        program: row.program ?? "",
        level: row.level ?? "",
        year: row.year ? Number(row.year) : 1,
      });
    }
    if (rows.length === 0) {
      setBulkParseError("No data rows found after header.");
      return;
    }
    setBulkPreview(rows);
  };

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const colleges = useMemo(
    () => collegesData?.items ?? [],
    [collegesData?.items],
  );
  const departments = useMemo(
    () => departmentsData?.items ?? [],
    [departmentsData?.items],
  );

  const collegeOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.college))).sort(),
    [items],
  );

  const departmentOptions = useMemo(() => {
    const base =
      college === "ALL"
        ? items
        : items.filter((item) => item.college === college);
    return Array.from(new Set(base.map((item) => item.department))).sort();
  }, [items, college]);

  const levelOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.level))).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const matchesSearch =
        normalized.length === 0 ||
        fullName.includes(normalized) ||
        item.email.toLowerCase().includes(normalized) ||
        item.studentId.toLowerCase().includes(normalized);

      const matchesCollege = college === "ALL" || item.college === college;
      const matchesDepartment =
        department === "ALL" || item.department === department;
      const matchesLevel = level === "ALL" || item.level === level;
      const matchesStatus = status === "ALL" || item.status === status;

      return (
        matchesSearch &&
        matchesCollege &&
        matchesDepartment &&
        matchesLevel &&
        matchesStatus
      );
    });
  }, [items, search, college, department, level, status]);

  const filteredMetrics = useMemo(
    () => ({
      totalStudents: filteredItems.length,
      totalColleges: new Set(filteredItems.map((item) => item.college)).size,
      totalDepartments: new Set(filteredItems.map((item) => item.department))
        .size,
      activeStudents: filteredItems.filter((item) => item.status === "ACTIVE")
        .length,
    }),
    [filteredItems],
  );

  const createCollegeOptions = useMemo(
    () => Array.from(new Set(colleges.map((item) => item.name))).sort(),
    [colleges],
  );

  const createDepartmentOptions = useMemo(() => {
    if (!newCollege) return [];
    return departments
      .filter((item) => item.college === newCollege)
      .map((item) => item.name)
      .sort();
  }, [departments, newCollege]);

  const createLevelOptions = useMemo(() => {
    const matchDepartment = departments.find(
      (item) => item.college === newCollege && item.name === newDepartment,
    );
    if (matchDepartment?.levels?.length) return matchDepartment.levels;
    const matchCollege = colleges.find((item) => item.name === newCollege);
    if (matchCollege?.levels?.length) return matchCollege.levels;
    return fallbackLevels(newDepartment);
  }, [colleges, departments, newCollege, newDepartment]);

  const editDepartmentOptions = useMemo(() => {
    if (!editingStudent?.college) return [];
    return departments
      .filter((item) => item.college === editingStudent.college)
      .map((item) => item.name)
      .sort();
  }, [departments, editingStudent]);

  const editLevelOptions = useMemo(() => {
    if (!editingStudent) return [];
    const matchDepartment = departments.find(
      (item) =>
        item.college === editingStudent.college &&
        item.name === editingStudent.department,
    );
    if (matchDepartment?.levels?.length) return matchDepartment.levels;
    const matchCollege = colleges.find(
      (item) => item.name === editingStudent.college,
    );
    if (matchCollege?.levels?.length) return matchCollege.levels;
    return fallbackLevels(editingStudent.department);
  }, [colleges, departments, editingStudent]);

  const canSubmitCreate =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.trim().length >= 8 &&
    studentId.trim() &&
    newCollege.trim() &&
    newDepartment.trim() &&
    newLevel.trim();

  const resetCreateForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setStudentId("");
    setNewCollege("");
    setNewDepartment("");
    setNewProgram("");
    setNewLevel("");
    setNewYear("1");
  };

  const openEdit = (row: StudentRow) => {
    setEditingStudent(row);
    setEditStatus(row.status);
  };

  return (
    <>
      <AdminDataView<StudentRow>
        title="Students"
        summary="Browse all student academic records with client-side filtering by college, department, level, and status."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={filteredMetrics}
        items={filteredItems}
        tableTourId="admin-students-table"
        columns={[
          {
            key: "name",
            label: "Student",
            render: (row) => `${row.firstName} ${row.lastName}`,
          },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "studentId", label: "Matric", render: (row) => row.studentId },
          { key: "college", label: "College", render: (row) => row.college },
          {
            key: "department",
            label: "Department",
            render: (row) => row.department,
          },
          { key: "program", label: "Program", render: (row) => row.program },
          { key: "level", label: "Level", render: (row) => row.level },
          { key: "status", label: "Status", render: (row) => row.status },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.location.assign(
                      `/dashboard/admin/student-plans?studentId=${encodeURIComponent(row.id)}`,
                    )
                  }
                >
                  Plan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateStudent.isPending}
                  onClick={() => openEdit(row)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteStudent.isPending}
                  onClick={() => setDeleteStudentRow(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="No students found"
        emptyMessage="Try adjusting the filters to broaden your student results."
        actions={
          <div
            className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-3"
            data-tour="admin-students-filters"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or matric"
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={college}
                onChange={(event) => setCollege(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All colleges</option>
                {collegeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All departments</option>
                {departmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All levels</option>
                {levelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div
              className="pt-2 border-t border-foreground/10"
              data-tour="admin-students-create"
            >
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Create student
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Create student</DialogTitle>
                    <DialogDescription>
                      Fill required fields. College, department, and level
                      values are sourced from available records.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="First name"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Last name"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      placeholder="Temp password (min 8)"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={studentId}
                      onChange={(event) =>
                        setStudentId(event.target.value.toUpperCase())
                      }
                      placeholder="Matric"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <select
                      value={newCollege}
                      onChange={(event) => {
                        setNewCollege(event.target.value);
                        setNewDepartment("");
                        setNewLevel("");
                      }}
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    >
                      <option value="">Select college</option>
                      {createCollegeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newDepartment}
                      onChange={(event) => {
                        setNewDepartment(event.target.value);
                        setNewLevel("");
                        if (!newProgram.trim())
                          setNewProgram(event.target.value);
                      }}
                      disabled={!newCollege}
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm disabled:opacity-50"
                    >
                      <option value="">Select department</option>
                      {createDepartmentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={newProgram}
                      onChange={(event) => setNewProgram(event.target.value)}
                      placeholder="Program"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <select
                      value={newLevel}
                      onChange={(event) => setNewLevel(event.target.value)}
                      disabled={!newDepartment && !newCollege}
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm disabled:opacity-50"
                    >
                      <option value="">Select level</option>
                      {createLevelOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={newYear}
                      onChange={(event) => setNewYear(event.target.value)}
                      type="number"
                      min={1}
                      placeholder="Year"
                      className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={!canSubmitCreate || createStudent.isPending}
                      onClick={() => {
                        createStudent.mutate(
                          {
                            firstName: firstName.trim(),
                            lastName: lastName.trim(),
                            email: email.trim(),
                            password,
                            studentId: studentId.trim(),
                            college: newCollege,
                            department: newDepartment,
                            program: newProgram || newDepartment,
                            level: newLevel,
                            year: Math.max(1, Number(newYear || 1)),
                          },
                          {
                            onSuccess: () => {
                              resetCreateForm();
                              setCreateOpen(false);
                            },
                          },
                        );
                      }}
                    >
                      {createStudent.isPending
                        ? "Creating..."
                        : "Create student"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={bulkOpen}
                onOpenChange={(open) => {
                  setBulkOpen(open);
                  if (!open) {
                    setBulkCsv("");
                    setBulkPreview([]);
                    setBulkResults(null);
                    setBulkParseError(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Bulk import (CSV)
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Bulk import students</DialogTitle>
                    <DialogDescription>
                      Paste CSV data below. Required columns:{" "}
                      <code className="text-xs bg-muted px-1 rounded">
                        firstName, lastName, email, password, studentId,
                        college, department, level
                      </code>
                      . Optional:{" "}
                      <code className="text-xs bg-muted px-1 rounded">
                        program, year
                      </code>
                      . Up to 200 rows per import.
                    </DialogDescription>
                  </DialogHeader>

                  {!bulkResults ? (
                    <div className="space-y-3">
                      <textarea
                        value={bulkCsv}
                        onChange={(e) => {
                          setBulkCsv(e.target.value);
                          setBulkPreview([]);
                          setBulkParseError(null);
                        }}
                        rows={6}
                        placeholder={`firstName,lastName,email,password,studentId,college,department,level,year\nJohn,Doe,john@uni.edu,Pass@123,CSC/2024/001,College of Science,Computer Science,100,1`}
                        className="w-full px-3 py-2 rounded-lg border border-foreground/20 bg-background text-xs font-mono resize-y"
                      />
                      {bulkParseError && (
                        <p className="text-xs text-destructive">
                          {bulkParseError}
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => parseBulkCsv(bulkCsv)}
                        disabled={!bulkCsv.trim()}
                      >
                        Parse &amp; Preview
                      </Button>

                      {bulkPreview.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {bulkPreview.length} row
                            {bulkPreview.length !== 1 ? "s" : ""} parsed —
                            review before importing.
                          </p>
                          <div className="overflow-x-auto max-h-56 border rounded-lg">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0 bg-muted">
                                <tr>
                                  {[
                                    "#",
                                    "Name",
                                    "Email",
                                    "Matric",
                                    "College",
                                    "Dept",
                                    "Level",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className="px-2 py-1 text-left font-medium"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {bulkPreview.map((row, idx) => (
                                  <tr key={idx} className="border-t">
                                    <td className="px-2 py-1">{idx + 1}</td>
                                    <td className="px-2 py-1">
                                      {row.firstName} {row.lastName}
                                    </td>
                                    <td className="px-2 py-1">{row.email}</td>
                                    <td className="px-2 py-1">
                                      {row.studentId}
                                    </td>
                                    <td className="px-2 py-1">{row.college}</td>
                                    <td className="px-2 py-1">
                                      {row.department}
                                    </td>
                                    <td className="px-2 py-1">{row.level}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          ✓ {bulkResults.filter((r) => r.success).length}{" "}
                          created
                        </span>
                        {bulkResults.some((r) => !r.success) && (
                          <span className="text-destructive font-medium">
                            ✗ {bulkResults.filter((r) => !r.success).length}{" "}
                            failed
                          </span>
                        )}
                      </div>
                      {bulkResults.some((r) => !r.success) && (
                        <div className="overflow-x-auto max-h-56 border rounded-lg">
                          <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-muted">
                              <tr>
                                {["Row", "Email", "Matric", "Error"].map(
                                  (h) => (
                                    <th
                                      key={h}
                                      className="px-2 py-1 text-left font-medium"
                                    >
                                      {h}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {bulkResults
                                .filter((r) => !r.success)
                                .map((r) => (
                                  <tr key={r.index} className="border-t">
                                    <td className="px-2 py-1">{r.index + 1}</td>
                                    <td className="px-2 py-1">{r.email}</td>
                                    <td className="px-2 py-1">{r.studentId}</td>
                                    <td className="px-2 py-1 text-destructive">
                                      {r.error}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    {!bulkResults ? (
                      <Button
                        disabled={
                          bulkPreview.length === 0 ||
                          bulkCreateStudents.isPending
                        }
                        onClick={() => {
                          bulkCreateStudents.mutate(bulkPreview, {
                            onSuccess: (data) => {
                              setBulkResults(data.results);
                              setBulkPreview([]);
                            },
                          });
                        }}
                      >
                        {bulkCreateStudents.isPending
                          ? `Importing ${bulkPreview.length} students…`
                          : `Import ${bulkPreview.length} students`}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBulkOpen(false);
                          setBulkCsv("");
                          setBulkPreview([]);
                          setBulkResults(null);
                        }}
                      >
                        Done
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />

      <Dialog
        open={Boolean(editingStudent)}
        onOpenChange={(open) => {
          if (!open) setEditingStudent(null);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>
              Update the student profile with valid mapped options.
            </DialogDescription>
          </DialogHeader>
          {editingStudent ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={editingStudent.firstName}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, firstName: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <input
                value={editingStudent.lastName}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, lastName: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <input
                value={editingStudent.email}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, email: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <input
                value={editingStudent.studentId}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev
                      ? { ...prev, studentId: event.target.value.toUpperCase() }
                      : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <select
                value={editingStudent.college}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          college: event.target.value,
                          department: "",
                          level: "",
                        }
                      : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                {createCollegeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={editingStudent.department}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          department: event.target.value,
                          level: "",
                          program: prev.program || event.target.value,
                        }
                      : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                {editDepartmentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={editingStudent.program}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, program: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <select
                value={editingStudent.level}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, level: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                {editLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={editingStudent.year}
                onChange={(event) =>
                  setEditingStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          year: Math.max(1, Number(event.target.value || 1)),
                        }
                      : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <select
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_VERIFICATION">
                  PENDING_VERIFICATION
                </option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={!editingStudent || updateStudent.isPending}
              onClick={() => {
                if (!editingStudent) return;
                updateStudent.mutate(
                  {
                    userId: editingStudent.id,
                    firstName: editingStudent.firstName.trim(),
                    lastName: editingStudent.lastName.trim(),
                    email: editingStudent.email.trim(),
                    studentId: editingStudent.studentId.trim(),
                    college: editingStudent.college,
                    department: editingStudent.department,
                    program: editingStudent.program,
                    level: editingStudent.level,
                    year: editingStudent.year,
                    status: editStatus,
                  },
                  {
                    onSuccess: () => setEditingStudent(null),
                  },
                );
              }}
            >
              {updateStudent.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteStudentRow)}
        onOpenChange={(open) => {
          if (!open) setDeleteStudentRow(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete student</DialogTitle>
            <DialogDescription>
              This action permanently removes the student account and profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStudentRow(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteStudent.isPending || !deleteStudentRow}
              onClick={() => {
                if (!deleteStudentRow) return;
                deleteStudent.mutate(deleteStudentRow.id, {
                  onSuccess: () => setDeleteStudentRow(null),
                });
              }}
            >
              {deleteStudent.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
