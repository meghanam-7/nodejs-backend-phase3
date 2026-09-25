const prisma = require("../config/prismaClient");

const searchJobs = async ({
  search,
  location,
  employmentType,
}) => {
  const jobs = await prisma.job.findMany({
    where: {
      status: "PUBLISHED",

      ...(location && {
        location: {
          contains: location,
          mode: "insensitive",
        },
      }),

      ...(employmentType && {
        employmentType: {
          equals: employmentType,
          mode: "insensitive",
        },
      }),

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            thresholds: {
              some: {
                competency: {
                  OR: [
                    {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    {
                      code: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      }),
    },

    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      thresholds: {
        include: {
          competency: true,
        },
      },
    },

    orderBy: {
      publishedAt: "desc",
    },
  });

  return jobs;
};

module.exports = {
  searchJobs,
};