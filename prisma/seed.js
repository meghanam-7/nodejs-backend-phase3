const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Task 2 competency data...");

    const competencies = [
        {
            code: "JAVASCRIPT",
            name: "JavaScript",
            description:
                "JavaScript programming and development skills.",
        },
        {
            code: "NODEJS",
            name: "Node.js",
            description:
                "Backend development using Node.js.",
        },
        {
            code: "REACT",
            name: "React",
            description:
                "Frontend development using React.",
        },
        {
            code: "PYTHON",
            name: "Python",
            description:
                "Python programming and development skills.",
        },
        {
            code: "SQL",
            name: "SQL",
            description:
                "Relational database and SQL skills.",
        },
        {
            code: "GIT",
            name: "Git",
            description:
                "Version control and Git workflow skills.",
        },
    ];

    for (const competency of competencies) {
        await prisma.competency.upsert({
            where: {
                code: competency.code,
            },
            update: {
                name: competency.name,
                description: competency.description,
            },
            create: competency,
        });
    }

    console.log("✅ Competencies seeded successfully");

    const allCompetencies = await prisma.competency.findMany({
        orderBy: {
            id: "asc",
        },
    });

    console.log("\n📚 Available competencies:");

    allCompetencies.forEach((competency) => {
        console.log(
            `   ${competency.id} - ${competency.code} - ${competency.name}`
        );
    });

    console.log("\n🎉 Task 2 seed completed successfully");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });